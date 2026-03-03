import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import Project from '../models/project.js';
import fetch from "node-fetch"; // Ensure node-fetch is installed
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";

// Helper to call Gemini for project plan
async function generateProjectPlan(report, language ) {
  const prompt = `Given the following soil analysis report (as JSON), generate a comprehensive crop project plan for the farmer. 
The plan should include all details from crop selection to harvest, including:

1. Recommended crop(s) based on soil report
2. Step-by-step cultivation plan (land preparation, sowing, irrigation, pest management, harvesting)
3. Fertilizer types, dosages, and application schedule
4. Organic amendments and micronutrient recommendations
5. Estimated budget for each stage
6. Total duration from sowing to harvest
7. Safety and environmental tips
8. Any other important advice for maximizing yield

Respond only in JSON format and provide all information in the user-specified language: ${language}.
Return the result in the following JSON structure:
{
  "cropPlan": {
    "crop": "Wheat",
    "variety": "HD2967",
    "totalDuration": "120 days",
    "budget": {
      "landPreparation": 5000,
      "seeds": 2000,
      "fertilizers": 3500,
      "irrigation": 2500,
      "pestControl": 1500,
      "harvesting": 3000,
      "total": 17500
    },
    "steps": [
      {
        "stage": "Land Preparation",
        "duration": "7 days",
        "tasks": [
          "Plow the field twice",
          "Level the soil",
          "Add organic compost if needed"
        ]
      },
      {
        "stage": "Sowing",
        "duration": "3 days",
        "tasks": [
          "Select certified seeds",
          "Sow seeds at recommended spacing",
          "Ensure proper soil moisture"
        ]
      },
      {
        "stage": "Vegetative Growth",
        "duration": "40 days",
        "fertilizers": [
          {
            "name": "Urea",
            "dosage": "50 kg/acre",
            "applicationMethod": "Broadcasting",
            "timing": "15 days after sowing"
          },
          {
            "name": "DAP",
            "dosage": "30 kg/acre",
            "applicationMethod": "Mix in soil",
            "timing": "At sowing"
          }
        ],
        "tasks": [
          "Irrigate every 7 days",
          "Weed control",
          "Monitor pests"
        ]
      },
      {
        "stage": "Flowering",
        "duration": "20 days",
        "fertilizers": [
          {
            "name": "Potash (K2O)",
            "dosage": "20 kg/acre",
            "applicationMethod": "Top dressing",
            "timing": "At flowering"
          }
        ],
        "tasks": [
          "Ensure proper irrigation",
          "Pest and disease management"
        ]
      },
      {
        "stage": "Grain Filling",
        "duration": "30 days",
        "tasks": [
          "Reduce irrigation slightly to avoid waterlogging",
          "Apply micronutrients if deficiencies are observed"
        ]
      },
      {
        "stage": "Harvesting",
        "duration": "10 days",
        "tasks": [
          "Harvest when grains are golden brown",
          "Thresh and clean grains",
          "Store in dry conditions"
        ]
      }
    ],
    "organicAmendments": [
      "Compost 2 tons/acre before sowing",
      "Green manure if possible"
    ],
    "micronutrients": [
      "Zinc 5 kg/acre at sowing",
      "Boron 1 kg/acre at flowering"
    ],
    "safetyAndEnvironmentalTips": [
      "Use gloves while applying chemicals",
      "Avoid overuse of fertilizers",
      "Maintain buffer zones near water bodies"
    ],
    "notes": "Monitor weather conditions regularly and adjust irrigation accordingly."
  }
}
Report:
${JSON.stringify(report)}
`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    }
  );
  if (!res.ok) throw new Error("Gemini API error");
  const data = await res.json();
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const match = text.match(/```json\s*([\s\S]*?)```/i);
    if (match) {
      return JSON.parse(match[1]);
    }
    console.log("Gemini raw response text:", text);
    return JSON.parse(text);
  } catch {
    throw new Error("Failed to parse Gemini response");
  }
}

// Middleware to validate JSON body for project creation
function validateProjectJson(req, res, next) {
  const { report } = req.body;
  if (!report) {
    return res.status(400).json({ error: 'Report JSON is required' });
  }
  try {
    // If report is a string, try to parse it
    if (typeof report === "string") {
      req.body.report = JSON.parse(report);
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON format for report' });
  }
  next();
}


router.post(
  '/create',
  authRequired,
  validateProjectJson,
  async (req, res) => {
    try {
    const user = await User.findById(req.user._id);
      const language=user.preferences.language ;
      
      const { report } = req.body;
      console.log("Creating project for user:", user._id,language);
      // Generate plan using Gemini
      const plan = await generateProjectPlan(report, language );
      console.log("Generated plan:", plan);
      const project = new Project({
        user,
        report,
        plan,
        
      });
      await project.save();
      res.status(201).json({ message: "Project created"});
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to create project" });
    }
  }
);


router.get(
  '/',
  authRequired,
  async (req, res) => {
    try {
      const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json({ projects });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to fetch projects" });
    }
  }
);

export default router;
