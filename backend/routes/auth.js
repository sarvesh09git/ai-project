import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'swasthya_ai_secret';

// Fallback in-memory database for users
const userMemoryDb = new Map();

// Helper to check DB connection
const isDbConnected = () => {
  return typeof mongoose !== 'undefined' && mongoose.connection && mongoose.connection.readyState === 1;
};

// @route   POST api/auth/register
// @desc    Register a user
router.post('/register', async (req, res) => {
  const { username, password, name, age, location, primaryLanguage, medicalHistory, emergencyContacts } = req.body;

  if (!username || !password || !name || !age) {
    return res.status(400).json({ message: 'Please enter all required fields (username, password, name, age).' });
  }

  try {
    // Attempt DB save
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      age,
      location: location || '',
      primaryLanguage: primaryLanguage || 'en',
      medicalHistory: medicalHistory || { allergies: [], medications: [], conditions: [] },
      emergencyContacts: emergencyContacts || []
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        age: newUser.age,
        location: newUser.location,
        primaryLanguage: newUser.primaryLanguage,
        medicalHistory: newUser.medicalHistory,
        emergencyContacts: newUser.emergencyContacts
      }
    });

  } catch (error) {
    console.error("DB Register failed, using memory DB fallback:", error);

    // Fallback registration in memory
    if (userMemoryDb.has(username)) {
      return res.status(400).json({ message: 'User already exists (in memory).' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const mockId = 'mem_' + Math.random().toString(36).substr(2, 9);
    const mockUser = {
      _id: mockId,
      username,
      password: hashedPassword,
      name,
      age: parseInt(age),
      location: location || '',
      primaryLanguage: primaryLanguage || 'en',
      medicalHistory: medicalHistory || { allergies: [], medications: [], conditions: [] },
      emergencyContacts: emergencyContacts || []
    };

    userMemoryDb.set(username, mockUser);
    
    // Also key by ID
    userMemoryDb.set(mockId, mockUser);

    const token = jwt.sign({ id: mockId }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: {
        id: mockId,
        username: mockUser.username,
        name: mockUser.name,
        age: mockUser.age,
        location: mockUser.location,
        primaryLanguage: mockUser.primaryLanguage,
        medicalHistory: mockUser.medicalHistory,
        emergencyContacts: mockUser.emergencyContacts,
        isMockUser: true
      }
    });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('User not found in DB');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        age: user.age,
        location: user.location,
        primaryLanguage: user.primaryLanguage,
        medicalHistory: user.medicalHistory,
        emergencyContacts: user.emergencyContacts
      }
    });

  } catch (error) {
    console.warn("DB Login failed, trying memory DB fallback...");

    const user = userMemoryDb.get(username);
    if (!user) {
      return res.status(400).json({ message: 'User does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        age: user.age,
        location: user.location,
        primaryLanguage: user.primaryLanguage,
        medicalHistory: user.medicalHistory,
        emergencyContacts: user.emergencyContacts,
        isMockUser: true
      }
    });
  }
});

// @route   GET api/auth/user
// @desc    Get user data
router.get('/user', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        return res.json(user);
      }
    } catch (dbErr) {
      // ignore and run memory fallback below
    }

    const memUser = userMemoryDb.get(decoded.id);
    if (memUser) {
      const { password, ...userSansPassword } = memUser;
      return res.json(userSansPassword);
    }

    return res.status(404).json({ message: 'User not found.' });
  } catch (err) {
    res.status(400).json({ message: 'Token is not valid.' });
  }
});

// @route   PUT api/auth/profile
// @desc    Update user health profile
router.put('/profile', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token, authorization denied.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const updates = req.body;

    try {
      const user = await User.findById(decoded.id);
      if (user) {
        if (updates.name) user.name = updates.name;
        if (updates.age) user.age = updates.age;
        if (updates.location !== undefined) user.location = updates.location;
        if (updates.primaryLanguage) user.primaryLanguage = updates.primaryLanguage;
        if (updates.medicalHistory) user.medicalHistory = updates.medicalHistory;
        if (updates.emergencyContacts) user.emergencyContacts = updates.emergencyContacts;

        await user.save();
        return res.json(user);
      }
    } catch (dbErr) {
      // run memory fallback
    }

    const memUser = userMemoryDb.get(decoded.id);
    if (memUser) {
      if (updates.name) memUser.name = updates.name;
      if (updates.age) memUser.age = updates.age;
      if (updates.location !== undefined) memUser.location = updates.location;
      if (updates.primaryLanguage) memUser.primaryLanguage = updates.primaryLanguage;
      if (updates.medicalHistory) memUser.medicalHistory = updates.medicalHistory;
      if (updates.emergencyContacts) memUser.emergencyContacts = updates.emergencyContacts;

      userMemoryDb.set(decoded.id, memUser);
      // update lookup username reference too
      userMemoryDb.set(memUser.username, memUser);

      const { password, ...userSansPassword } = memUser;
      return res.json(userSansPassword);
    }

    return res.status(404).json({ message: 'User not found.' });
  } catch (err) {
    res.status(400).json({ message: 'Error updating profile.' });
  }
});

export default router;
