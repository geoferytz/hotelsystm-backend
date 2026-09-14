const { FoodRequest, DrinkRequest, Room, Booking, Billing } = require('../models');
const { createNotification } = require('./notification.controller');

// Food Request Controllers
exports.createFoodRequest = async (req, res) => {
  try {
    const { roomId, guestName, items, requestedBy, notes } = req.body;

    // Validate required fields
    if (!roomId || !guestName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields: roomId, guestName, and items are required.' });
    }

    // Verify room exists
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity) {
        return res.status(400).json({ message: 'Each item must have name, price, and quantity.' });
      }
      totalAmount += parseFloat(item.price) * parseInt(item.quantity);
    }

    // Create food request
    const foodRequest = await FoodRequest.create({
      roomId,
      guestName,
      items,
      totalAmount,
      requestedBy: requestedBy || req.user?.fullName || 'System',
      notes: notes || null,
      hotelId: room.hotelId,
      status: 'pending'
    });

    // Add to room billing
    await addToRoomBilling(roomId, totalAmount, 'Food Request', foodRequest.id, room.hotelId, 'food');

    // Create notification
    await createNotification('food', 'New Food Request', `${guestName} in Room ${room.roomNumber} requested food items`, foodRequest.id, 'FoodRequest', room.hotelId);

    res.status(201).json({
      message: 'Food request created successfully!',
      request: foodRequest
    });
  } catch (error) {
    console.error('Food request error:', error);
    res.status(500).json({ message: 'Failed to create food request.', error: error.message });
  }
};

exports.getAllFoodRequests = async (req, res) => {
  try {
    const requests = await FoodRequest.findAll({
      include: [{ model: Room, as: 'Room', attributes: ['roomNumber', 'hotelId'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch food requests.', error: error.message });
  }
};

exports.getFoodRequestsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const requests = await FoodRequest.findAll({
      where: { roomId },
      include: [{ model: Room, as: 'Room', attributes: ['roomNumber'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch food requests.', error: error.message });
  }
};

exports.updateFoodRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await FoodRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Food request not found.' });
    }

    await request.update({ status });

    // If cancelled, remove from billing
    if (status === 'cancelled') {
      await removeFromRoomBilling(request.roomId, request.totalAmount, 'Food Request', request.id);
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update food request status.', error: error.message });
  }
};

// Drink Request Controllers
exports.createDrinkRequest = async (req, res) => {
  try {
    const { roomId, guestName, items, requestedBy, notes } = req.body;

    // Validate required fields
    if (!roomId || !guestName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields: roomId, guestName, and items are required.' });
    }

    // Verify room exists
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity) {
        return res.status(400).json({ message: 'Each item must have name, price, and quantity.' });
      }
      totalAmount += parseFloat(item.price) * parseInt(item.quantity);
    }

    // Create drink request
    const drinkRequest = await DrinkRequest.create({
      roomId,
      guestName,
      items,
      totalAmount,
      requestedBy: requestedBy || req.user?.fullName || 'System',
      notes: notes || null,
      hotelId: room.hotelId,
      status: 'pending'
    });

    // Add to room billing
    await addToRoomBilling(roomId, totalAmount, 'Drink Request', drinkRequest.id, room.hotelId, 'drink');

    // Create notification
    await createNotification('drink', 'New Drink Request', `${guestName} in Room ${room.roomNumber} requested drinks`, drinkRequest.id, 'DrinkRequest', room.hotelId);

    res.status(201).json({
      message: 'Drink request created successfully!',
      request: drinkRequest
    });
  } catch (error) {
    console.error('Drink request error:', error);
    res.status(500).json({ message: 'Failed to create drink request.', error: error.message });
  }
};

exports.getAllDrinkRequests = async (req, res) => {
  try {
    const requests = await DrinkRequest.findAll({
      include: [{ model: Room, as: 'Room', attributes: ['roomNumber', 'hotelId'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch drink requests.', error: error.message });
  }
};

exports.getDrinkRequestsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const requests = await DrinkRequest.findAll({
      where: { roomId },
      include: [{ model: Room, as: 'Room', attributes: ['roomNumber'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch drink requests.', error: error.message });
  }
};

exports.updateDrinkRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await DrinkRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Drink request not found.' });
    }

    await request.update({ status });

    // If cancelled, remove from billing
    if (status === 'cancelled') {
      await removeFromRoomBilling(request.roomId, request.totalAmount, 'Drink Request', request.id);
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update drink request status.', error: error.message });
  }
};

// Helper function to add charges to room billing
async function addToRoomBilling(roomId, amount, description, referenceId, hotelId, type) {
  try {
    console.log(`Adding to room billing - Room: ${roomId}, Amount: ${amount}, Reference: ${referenceId}, Type: ${type}`);
    
    // Find active booking for the room
    const booking = await Booking.findOne({
      where: { roomId, status: 'checked-in' }
    });

    if (!booking) {
      console.log(`No active booking found for room ${roomId} with status 'checked-in'`);
      return;
    }

    console.log(`Found booking: ${booking.id} for room ${roomId}`);

    // Create or update billing entry
    const billing = await Billing.findOne({
      where: { bookingId: booking.id }
    });

    const charge = {
      name: description,
      quantity: 1,
      price: parseFloat(amount),
      subtotal: parseFloat(amount),
      type: type || 'other',
      referenceId,
      date: new Date().toISOString()
    };

    console.log('Charge to add:', charge);

    if (billing) {
      const extraCharges = billing.extraCharges || [];
      extraCharges.push(charge);
      await billing.update({
        totalAmount: parseFloat(billing.totalAmount) + parseFloat(amount),
        extraCharges
      });
      console.log(`Updated billing ${billing.id} with new charge`);
    } else {
      const newBilling = await Billing.create({
        bookingId: booking.id,
        customerId: booking.customerId,
        totalAmount: parseFloat(amount),
        extraCharges: [charge],
        hotelId,
        paymentStatus: 'pending'
      });
      console.log(`Created new billing ${newBilling.id} for booking ${booking.id}`);
    }
  } catch (error) {
    console.error('Error adding to room billing:', error);
  }
}

// Helper function to remove charges from room billing
async function removeFromRoomBilling(roomId, amount, description, referenceId) {
  try {
    // Find active booking for the room
    const booking = await Booking.findOne({
      where: { roomId, status: 'checked-in' }
    });

    if (booking) {
      const billing = await Billing.findOne({
        where: { bookingId: booking.id }
      });

      if (billing) {
        const extraCharges = billing.extraCharges || [];
        const updatedCharges = extraCharges.filter(charge => charge.referenceId !== referenceId);
        await billing.update({
          totalAmount: Math.max(0, parseFloat(billing.totalAmount) - parseFloat(amount)),
          extraCharges: updatedCharges
        });
      }
    }
  } catch (error) {
    console.error('Error removing from room billing:', error);
  }
}
