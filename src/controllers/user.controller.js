const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

// GET /api/users
exports.getAll = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'Role', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
  }
};

// GET /api/users/:id
exports.getOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user.', error: error.message });
  }
};

// POST /api/users
exports.create = async (req, res) => {
  try {
    const { fullName, username, email, password, role, roleId } = req.body;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: 'Email already registered.' });

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) return res.status(400).json({ message: 'Username already taken.' });

    // If roleId is provided, use it and sync role string
    let finalRoleId = roleId;
    let finalRole = role;
    
    if (roleId) {
      const roleRecord = await Role.findByPk(roleId);
      if (roleRecord) {
        finalRole = roleRecord.name;
      }
    } else if (role) {
      // If only role string is provided, find the roleId
      const roleRecord = await Role.findOne({ where: { name: role } });
      if (roleRecord) {
        finalRoleId = roleRecord.id;
      }
    }

    const user = await User.create({ fullName, username, email, password, role: finalRole, roleId: finalRoleId });
    res.status(201).json({
      id: user.id, fullName: user.fullName, username: user.username,
      email: user.email, role: user.role, roleId: user.roleId, isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user.', error: error.message });
  }
};

// PUT /api/users/:id
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { fullName, email, role, roleId, isActive } = req.body;

    // Sync roleId with role string
    let finalRoleId = roleId !== undefined ? roleId : user.roleId;
    let finalRole = role !== undefined ? role : user.role;
    
    if (roleId !== undefined) {
      const roleRecord = await Role.findByPk(roleId);
      if (roleRecord) {
        finalRole = roleRecord.name;
      }
    } else if (role !== undefined) {
      const roleRecord = await Role.findOne({ where: { name: role } });
      if (roleRecord) {
        finalRoleId = roleRecord.id;
      }
    }

    await user.update({ fullName, email, role: finalRole, roleId: finalRoleId, isActive });

    res.json({
      id: user.id, fullName: user.fullName, username: user.username,
      email: user.email, role: user.role, roleId: user.roleId, isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user.', error: error.message });
  }
};

// PUT /api/users/:id/password
exports.changePassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password.', error: error.message });
  }
};

// PUT /api/users/:id/toggle-active
exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({
      id: user.id, fullName: user.fullName, username: user.username,
      email: user.email, role: user.role, isActive: user.isActive,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle user status.', error: error.message });
  }
};

// DELETE /api/users/:id
exports.remove = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await user.destroy();
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user.', error: error.message });
  }
};
