const { Role, Permission, RolePermission } = require('../models');

// GET /api/roles
exports.getAll = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ model: Permission, as: 'Permissions', through: { attributes: [] } }],
      order: [['name', 'ASC']],
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch roles.', error: error.message });
  }
};

// GET /api/roles/:id
exports.getOne = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [{ model: Permission, as: 'Permissions', through: { attributes: [] } }],
    });
    if (!role) return res.status(404).json({ message: 'Role not found.' });
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch role.', error: error.message });
  }
};

// POST /api/roles
exports.create = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;
    const role = await Role.create({ name, description });
    if (permissionIds && permissionIds.length > 0) {
      const entries = permissionIds.map(pid => ({ roleId: role.id, permissionId: pid }));
      await RolePermission.bulkCreate(entries);
    }
    const result = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'Permissions', through: { attributes: [] } }],
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create role.', error: error.message });
  }
};

// PUT /api/roles/:id
exports.update = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found.' });
    const { name, description, isActive, permissionIds } = req.body;
    await role.update({ name, description, isActive });
    if (permissionIds !== undefined) {
      await RolePermission.destroy({ where: { roleId: role.id } });
      if (permissionIds.length > 0) {
        const entries = permissionIds.map(pid => ({ roleId: role.id, permissionId: pid }));
        await RolePermission.bulkCreate(entries);
      }
    }
    const result = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'Permissions', through: { attributes: [] } }],
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update role.', error: error.message });
  }
};

// DELETE /api/roles/:id
exports.remove = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found.' });
    await RolePermission.destroy({ where: { roleId: role.id } });
    await role.destroy();
    res.json({ message: 'Role deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete role.', error: error.message });
  }
};

// GET /api/permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({ order: [['module', 'ASC'], ['action', 'ASC']] });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch permissions.', error: error.message });
  }
};

// POST /api/permissions
exports.createPermission = async (req, res) => {
  try {
    const perm = await Permission.create(req.body);
    res.status(201).json(perm);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create permission.', error: error.message });
  }
};

// DELETE /api/permissions/:id
exports.removePermission = async (req, res) => {
  try {
    const perm = await Permission.findByPk(req.params.id);
    if (!perm) return res.status(404).json({ message: 'Permission not found.' });
    await RolePermission.destroy({ where: { permissionId: perm.id } });
    await perm.destroy();
    res.json({ message: 'Permission deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete permission.', error: error.message });
  }
};
