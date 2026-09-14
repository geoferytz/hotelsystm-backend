const { InventoryCategory, InventoryItem, InventoryStock } = require('../models');
const { Op } = require('sequelize');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

// ==================== Categories ====================

exports.getAllCategories = async (req, res) => {
  try {
    const where = {};
    addHotelFilter(where, req);
    const categories = await InventoryCategory.findAll({ where, order: [['name', 'ASC']] });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories.', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await InventoryCategory.findByPk(req.params.id, {
      include: [{ model: InventoryItem, as: 'Items' }]
    });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category.', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await InventoryCategory.create(addHotelId({ name, description }, req));
    res.status(201).json({ message: 'Category created successfully.', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category.', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await InventoryCategory.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    await category.update(req.body);
    res.json({ message: 'Category updated successfully.', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category.', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await InventoryCategory.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    await category.destroy();
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category.', error: error.message });
  }
};

// ==================== Items ====================

exports.getAllItems = async (req, res) => {
  try {
    const { categoryId, lowStock } = req.query;
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (lowStock === 'true') {
      where.quantity = { [Op.lte]: 10 };
    }
    addHotelFilter(where, req);

    const items = await InventoryItem.findAll({
      where,
      include: [{ model: InventoryCategory, as: 'Category' }],
      order: [['name', 'ASC']]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch items.', error: error.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id, {
      include: [
        { model: InventoryCategory, as: 'Category' },
        { model: InventoryStock, as: 'StockMovements', order: [['createdAt', 'DESC']] }
      ]
    });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    
    // Calculate current stock
    const stockMovements = item.StockMovements || [];
    const currentStock = stockMovements.reduce((total, movement) => {
      if (movement.movementType === 'in' || movement.movementType === 'adjustment') {
        return total + movement.quantity;
      } else if (movement.movementType === 'out' || movement.movementType === 'transfer') {
        return total - movement.quantity;
      }
      return total;
    }, 0);
    
    res.json({ ...item.toJSON(), currentStock });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch item.', error: error.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { name, sku, description, unit, minStockLevel, maxStockLevel, unitPrice, reorderPoint, categoryId } = req.body;
    const item = await InventoryItem.create(addHotelId({
      name, sku, description, unit, minStockLevel, maxStockLevel, unitPrice, reorderPoint, categoryId
    }, req));
    res.status(201).json({ message: 'Item created successfully.', item });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create item.', error: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    await item.update(req.body);
    res.json({ message: 'Item updated successfully.', item });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update item.', error: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    await item.destroy();
    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete item.', error: error.message });
  }
};

// ==================== Stock Movements ====================

exports.getAllStockMovements = async (req, res) => {
  try {
    const { itemId, movementType } = req.query;
    const where = {};
    if (itemId) where.itemId = itemId;
    if (movementType) where.movementType = movementType;
    addHotelFilter(where, req);

    const movements = await InventoryStock.findAll({
      where,
      include: [{ model: InventoryItem, as: 'Item' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stock movements.', error: error.message });
  }
};

exports.createStockMovement = async (req, res) => {
  try {
    const { itemId, quantity, movementType, reference, notes } = req.body;
    const movement = await InventoryStock.create(addHotelId({
      itemId, quantity, movementType, reference, notes
    }, req));
    res.status(201).json({ message: 'Stock movement recorded successfully.', movement });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record stock movement.', error: error.message });
  }
};

exports.getStockSummary = async (req, res) => {
  try {
    const where = {};
    addHotelFilter(where, req);

    const items = await InventoryItem.findAll({
      where,
      include: [{ model: InventoryCategory, as: 'Category' }]
    });

    const summary = await Promise.all(items.map(async (item) => {
      const movements = await InventoryStock.findAll({
        where: { itemId: item.id }
      });
      
      const currentStock = movements.reduce((total, movement) => {
        if (movement.movementType === 'in' || movement.movementType === 'adjustment') {
          return total + movement.quantity;
        } else if (movement.movementType === 'out' || movement.movementType === 'transfer') {
          return total - movement.quantity;
        }
        return total;
      }, 0);

      return {
        ...item.toJSON(),
        currentStock,
        status: currentStock <= item.minStockLevel ? 'low' : currentStock >= item.maxStockLevel ? 'overstock' : 'normal'
      };
    }));

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stock summary.', error: error.message });
  }
};
