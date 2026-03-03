// src/controllers/auth.controller.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Blacklist from "../models/blacklist.js";


export async function register(req, res) {
  const { name, password, preferredLanguage, age, farmerType, mobile, location } = req.body;
  console.log("Incoming body:", req.body);

  // Validate required fields
  if (!name || !password || !mobile) {
    return res.status(400).json({ error: 'Name, password, and mobile are required.' });
  }

  try {
    const exists = await User.findOne({ mobile });
    if (exists) {
      return res.status(409).json({ error: 'Mobile already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      passwordHash,
      age,
      farmerType,
      mobile,
      location,
      preferences: { language: preferredLanguage  }
    });

    console.log("Created user:", user);
    return res.status(201).json({ message: "User registered successfully", userId: user._id });

  } catch (err) {
    console.error("Registration error:", err);

    if (err.code === 11000) {
      return res.status(409).json({ error: 'Mobile already registered' });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }

    return res.status(500).json({ error: 'Registration failed' });
  }
}


export async function login(req, res) {
  const { mobile, password } = req.body;
  console.log("Login attempt for mobile:", mobile, "with password:", password ? '***' : '(no password)');

  try {
    // Find user by mobile
    const user = await User.findOne({ mobile }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign(
      { sub: user._id.toString() },
      "key", 
      { expiresIn: '7d' }
    );
    console.log("Login successful for user:", user._id);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        language: user.preferences.language,
        farmerType: user.farmerType,
        location: user.location,
        age: user.age
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  delete user.passwordHash;
  return res.json(user);
}
export async function logout(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"

    if (!token) {
      return res.status(400).json({ error: "Token required for logout" });
    }

    // Save token to blacklist
    await Blacklist.create({ token });

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}