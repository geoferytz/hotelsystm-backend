require('dotenv').config();
const sequelize = require('../config/db');
const { Role, Permission, RolePermission } = require('../models');

async function seedPermissions() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // Clear existing permissions and role permissions
    await RolePermission.destroy({ where: {} });
    await Permission.destroy({ where: {} });
    console.log('Cleared existing permissions and role permissions.');

    // Define all permissions
    const allPermissions = [
      // Rooms
      { module: 'rooms', action: 'view', description: 'View rooms' },
      { module: 'rooms', action: 'create', description: 'Create rooms' },
      { module: 'rooms', action: 'edit', description: 'Edit rooms' },
      { module: 'rooms', action: 'delete', description: 'Delete rooms' },
      { module: 'rooms', action: 'manage', description: 'Manage rooms' },
      // Bookings
      { module: 'bookings', action: 'view', description: 'View bookings' },
      { module: 'bookings', action: 'create', description: 'Create bookings' },
      { module: 'bookings', action: 'edit', description: 'Edit bookings' },
      { module: 'bookings', action: 'delete', description: 'Delete bookings' },
      { module: 'bookings', action: 'manage', description: 'Manage bookings' },
      // Customers
      { module: 'customers', action: 'view', description: 'View customers' },
      { module: 'customers', action: 'create', description: 'Create customers' },
      { module: 'customers', action: 'edit', description: 'Edit customers' },
      { module: 'customers', action: 'delete', description: 'Delete customers' },
      { module: 'customers', action: 'manage', description: 'Manage customers' },
      // Billing
      { module: 'billing', action: 'view', description: 'View billing' },
      { module: 'billing', action: 'create', description: 'Create billing' },
      { module: 'billing', action: 'edit', description: 'Edit billing' },
      { module: 'billing', action: 'delete', description: 'Delete billing' },
      { module: 'billing', action: 'manage', description: 'Manage billing' },
      // Workers
      { module: 'workers', action: 'view', description: 'View workers' },
      { module: 'workers', action: 'create', description: 'Create workers' },
      { module: 'workers', action: 'edit', description: 'Edit workers' },
      { module: 'workers', action: 'delete', description: 'Delete workers' },
      { module: 'workers', action: 'manage', description: 'Manage workers' },
      // Shifts
      { module: 'shifts', action: 'view', description: 'View shifts' },
      { module: 'shifts', action: 'create', description: 'Create shifts' },
      { module: 'shifts', action: 'edit', description: 'Edit shifts' },
      { module: 'shifts', action: 'delete', description: 'Delete shifts' },
      { module: 'shifts', action: 'manage', description: 'Manage shifts' },
      // Reports
      { module: 'reports', action: 'view', description: 'View reports' },
      { module: 'reports', action: 'create', description: 'Create reports' },
      { module: 'reports', action: 'export', description: 'Export reports' },
      { module: 'reports', action: 'manage', description: 'Manage reports' },
      // Users
      { module: 'users', action: 'view', description: 'View users' },
      { module: 'users', action: 'create', description: 'Create users' },
      { module: 'users', action: 'edit', description: 'Edit users' },
      { module: 'users', action: 'delete', description: 'Delete users' },
      { module: 'users', action: 'manage', description: 'Manage users' },
      // Roles
      { module: 'roles', action: 'view', description: 'View roles' },
      { module: 'roles', action: 'create', description: 'Create roles' },
      { module: 'roles', action: 'edit', description: 'Edit roles' },
      { module: 'roles', action: 'delete', description: 'Delete roles' },
      { module: 'roles', action: 'manage', description: 'Manage roles' },
      // Hotels
      { module: 'hotels', action: 'view', description: 'View hotels' },
      { module: 'hotels', action: 'create', description: 'Create hotels' },
      { module: 'hotels', action: 'edit', description: 'Edit hotels' },
      { module: 'hotels', action: 'delete', description: 'Delete hotels' },
      { module: 'hotels', action: 'manage', description: 'Manage hotels' },
      // Services
      { module: 'services', action: 'view', description: 'View services' },
      { module: 'services', action: 'create', description: 'Create services' },
      { module: 'services', action: 'edit', description: 'Edit services' },
      { module: 'services', action: 'delete', description: 'Delete services' },
      { module: 'services', action: 'manage', description: 'Manage services' },
      // Meals
      { module: 'meals', action: 'view', description: 'View meals' },
      { module: 'meals', action: 'create', description: 'Create meals' },
      { module: 'meals', action: 'edit', description: 'Edit meals' },
      { module: 'meals', action: 'delete', description: 'Delete meals' },
      { module: 'meals', action: 'manage', description: 'Manage meals' },
      // Restaurant
      { module: 'restaurant', action: 'view', description: 'View restaurants' },
      { module: 'restaurant', action: 'create', description: 'Create restaurants and menus' },
      { module: 'restaurant', action: 'edit', description: 'Edit restaurants and menus' },
      { module: 'restaurant', action: 'delete', description: 'Delete restaurants and menus' },
      { module: 'restaurant', action: 'manage', description: 'Manage restaurants and menus' },
      // Settings
      { module: 'settings', action: 'view', description: 'View settings' },
      { module: 'settings', action: 'edit', description: 'Edit settings' },
      { module: 'settings', action: 'manage', description: 'Manage settings' },
    ];

    // Create permissions
    const permissions = await Permission.bulkCreate(allPermissions, { ignoreDuplicates: true });
    console.log(`Created ${permissions.length} permissions.`);

    // Create roles
    const adminRole = await Role.findOrCreate({
      where: { name: 'admin' },
      defaults: { name: 'admin', description: 'System Administrator with full access' }
    });
    const receptionistRole = await Role.findOrCreate({
      where: { name: 'receptionist' },
      defaults: { name: 'receptionist', description: 'Front desk staff with limited access' }
    });
    const staffRole = await Role.findOrCreate({
      where: { name: 'staff' },
      defaults: { name: 'staff', description: 'General staff with minimal access' }
    });
    console.log('Created default roles: admin, receptionist, staff');

    // Assign all permissions to admin
    const allPermissionIds = permissions.map(p => p.id);
    await RolePermission.destroy({ where: { roleId: adminRole[0].id } });
    const adminPermissions = allPermissionIds.map(pid => ({ roleId: adminRole[0].id, permissionId: pid }));
    await RolePermission.bulkCreate(adminPermissions);
    console.log('Assigned all permissions to admin role');

    // Assign limited permissions to receptionist
    const receptionistPermissions = [
      'rooms.view', 'rooms.create', 'rooms.edit',
      'bookings.view', 'bookings.create', 'bookings.edit',
      'customers.view', 'customers.create', 'customers.edit',
      'billing.view', 'billing.create', 'billing.edit',
      'restaurant.view', 'restaurant.create', 'restaurant.edit',
      'reports.view',
    ];
    await RolePermission.destroy({ where: { roleId: receptionistRole[0].id } });
    const receptionistPermIds = permissions
      .filter(p => receptionistPermissions.includes(`${p.module}.${p.action}`))
      .map(p => ({ roleId: receptionistRole[0].id, permissionId: p.id }));
    await RolePermission.bulkCreate(receptionistPermIds);
    console.log('Assigned limited permissions to receptionist role');

    // Assign minimal permissions to staff
    const staffPermissions = ['rooms.view', 'bookings.view'];
    await RolePermission.destroy({ where: { roleId: staffRole[0].id } });
    const staffPermIds = permissions
      .filter(p => staffPermissions.includes(`${p.module}.${p.action}`))
      .map(p => ({ roleId: staffRole[0].id, permissionId: p.id }));
    await RolePermission.bulkCreate(staffPermIds);
    console.log('Assigned minimal permissions to staff role');

    console.log('Permission seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedPermissions();
