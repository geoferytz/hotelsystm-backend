const User = require('./user.model');
const Room = require('./room.model');
const Customer = require('./customer.model');
const Booking = require('./booking.model');
const Billing = require('./billing.model');
const Shift = require('./shift.model');
const Worker = require('./worker.model');
const Role = require('./role.model');
const Permission = require('./permission.model');
const RolePermission = require('./role-permission.model');
const Notification = require('./notification.model');
const RoomType = require('./room-type.model');
const Meal = require('./meal.model');
const HotelService = require('./hotel-service.model');
const Restaurant = require('./restaurant.model');
const RestaurantMenu = require('./restaurant-menu.model');
const RestaurantMenuOrder = require('./restaurant-menu-order.model');
const RestaurantTableBooking = require('./restaurant-table-booking.model');
const FoodRequest = require('./food-request.model');
const DrinkRequest = require('./drink-request.model');
const Hotel = require('./hotel.model');
const UserHotel = require('./user-hotel.model');
const InventoryCategory = require('./inventory-category.model');
const InventoryItem = require('./inventory-item.model');
const InventoryStock = require('./inventory-stock.model');
const Refund = require('./refund.model');
const Expense = require('./expense.model');
const Salary = require('./salary.model');

// Hotel associations
User.belongsToMany(Hotel, { through: UserHotel, foreignKey: 'userId', as: 'Hotels' });
Hotel.belongsToMany(User, { through: UserHotel, foreignKey: 'hotelId', as: 'Users' });
UserHotel.belongsTo(Hotel, { foreignKey: 'hotelId', as: 'Hotel' });
UserHotel.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Hotel.hasMany(UserHotel, { foreignKey: 'hotelId', as: 'Members' });

// User-Role association
User.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'Users' });

// Hotel -> operational model associations
Hotel.hasMany(Room, { foreignKey: 'hotelId' });
Room.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(Booking, { foreignKey: 'hotelId' });
Booking.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(Billing, { foreignKey: 'hotelId' });
Billing.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(Worker, { foreignKey: 'hotelId' });
Worker.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(Shift, { foreignKey: 'hotelId' });
Shift.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(RoomType, { foreignKey: 'hotelId' });
RoomType.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(Meal, { foreignKey: 'hotelId' });
Meal.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(HotelService, { foreignKey: 'hotelId' });
HotelService.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(Restaurant, { foreignKey: 'hotelId' });
Restaurant.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(RestaurantMenu, { foreignKey: 'hotelId' });
RestaurantMenu.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(Notification, { foreignKey: 'hotelId' });
Notification.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(InventoryCategory, { foreignKey: 'hotelId' });
InventoryCategory.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(InventoryItem, { foreignKey: 'hotelId' });
InventoryItem.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(InventoryStock, { foreignKey: 'hotelId' });
InventoryStock.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(Refund, { foreignKey: 'hotelId' });
Refund.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(Expense, { foreignKey: 'hotelId' });
Expense.belongsTo(Hotel, { foreignKey: 'hotelId' });
Hotel.hasMany(Salary, { foreignKey: 'hotelId' });
Salary.belongsTo(Hotel, { foreignKey: 'hotelId' });

// Restaurant associations
Restaurant.hasMany(RestaurantMenu, { foreignKey: 'restaurantId', as: 'Menus' });
RestaurantMenu.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'Restaurant' });

// Inventory associations
InventoryCategory.hasMany(InventoryItem, { foreignKey: 'categoryId', as: 'Items' });
InventoryItem.belongsTo(InventoryCategory, { foreignKey: 'categoryId', as: 'Category' });
InventoryItem.hasMany(InventoryStock, { foreignKey: 'itemId', as: 'StockMovements' });
InventoryStock.belongsTo(InventoryItem, { foreignKey: 'itemId', as: 'Item' });

// Food and Drink Request associations
Room.hasMany(FoodRequest, { foreignKey: 'roomId', as: 'FoodRequests' });
FoodRequest.belongsTo(Room, { foreignKey: 'roomId', as: 'Room' });
Room.hasMany(DrinkRequest, { foreignKey: 'roomId', as: 'DrinkRequests' });
DrinkRequest.belongsTo(Room, { foreignKey: 'roomId', as: 'Room' });

// Worker associations
Worker.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasOne(Worker, { foreignKey: 'userId', as: 'Worker' });

// Role-Permission many-to-many
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', as: 'Permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', as: 'Roles' });

// Refund associations
Billing.hasMany(Refund, { foreignKey: 'billingId', as: 'Refunds' });
Refund.belongsTo(Billing, { foreignKey: 'billingId', as: 'Billing' });

User.hasMany(Refund, { foreignKey: 'processedBy', as: 'ProcessedRefunds' });
Refund.belongsTo(User, { foreignKey: 'processedBy', as: 'Processor' });

// Expense associations
User.hasMany(Expense, { foreignKey: 'approvedBy', as: 'ApprovedExpenses' });
Expense.belongsTo(User, { foreignKey: 'approvedBy', as: 'Approver' });

// Salary associations
Worker.hasMany(Salary, { foreignKey: 'workerId', as: 'Salaries' });
Salary.belongsTo(Worker, { foreignKey: 'workerId', as: 'Employee' });

module.exports = {
  User,
  Room,
  Customer,
  Booking,
  Billing,
  Shift,
  Worker,
  Role,
  Permission,
  RolePermission,
  Notification,
  RoomType,
  Meal,
  HotelService,
  Restaurant,
  RestaurantMenu,
  RestaurantMenuOrder,
  RestaurantTableBooking,
  FoodRequest,
  DrinkRequest,
  Hotel,
  UserHotel,
  InventoryCategory,
  InventoryItem,
  InventoryStock,
  Refund,
  Expense,
  Salary,
};
