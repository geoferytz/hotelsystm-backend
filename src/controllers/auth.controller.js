const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { Role, Permission } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, roleId: user.roleId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { fullName, username, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken.' });
    }

    const user = await User.create({ fullName, username, email, password, role });

    const token = generateToken(user);
    res.status(201).json({
      message: 'User registered successfully.',
      user: { id: user.id, fullName: user.fullName, username: user.username, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = typeof username === 'string' ? username.trim() : username;
    console.log('Login attempt for username:', normalizedUsername);

    const user = await User.findOne({
      where: { username: normalizedUsername },
      include: [{ 
        model: Role, as: 'Role', 
        attributes: ['id', 'name'],
        include: [{ model: Permission, as: 'Permissions', through: { attributes: [] }, attributes: ['module', 'action'] }]
      }],
    });
    if (!user) {
      console.log('User not found:', normalizedUsername);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    console.log('User found:', user.username, 'Active:', user.isActive);

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Build permissions array from role
    const permissions = user.Role && user.Role.Permissions
      ? user.Role.Permissions.map(p => `${p.module}.${p.action}`)
      : [];

    const token = generateToken(user);
    res.json({
      message: 'Login successful.',
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        roleId: user.roleId,
        permissions
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile.', error: error.message });
  }
};

// GET /api/auth/users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
  }
};
