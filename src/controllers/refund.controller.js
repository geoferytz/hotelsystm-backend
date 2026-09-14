const { Refund, Billing, Customer, Booking, User } = require('../models');
const { Op } = require('sequelize');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

exports.getAllRefunds = async (req, res) => {
  try {
    const where = {};
    addHotelFilter(where, req);

    const refunds = await Refund.findAll({
      where,
      include: [
        {
          model: Billing,
          as: 'Billing',
          include: [
            { model: Customer, as: 'Customer' },
            { model: Booking, as: 'Booking' },
          ],
        },
        {
          model: User,
          as: 'Processor',
          attributes: ['id', 'username', 'fullName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(refunds);
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({ message: 'Failed to fetch refunds' });
  }
};

exports.getRefundById = async (req, res) => {
  try {
    const { id } = req.params;

    const refund = await Refund.findByPk(id, {
      include: [
        {
          model: Billing,
          as: 'Billing',
          include: [
            { model: Customer, as: 'Customer' },
            { model: Booking, as: 'Booking' },
          ],
        },
        {
          model: User,
          as: 'Processor',
          attributes: ['id', 'username', 'fullName'],
        },
      ],
    });

    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    res.json(refund);
  } catch (error) {
    console.error('Error fetching refund:', error);
    res.status(500).json({ message: 'Failed to fetch refund' });
  }
};

exports.createRefund = async (req, res) => {
  try {
    const { billingId, amount, reason, refundMethod, notes } = req.body;

    if (!billingId || !amount || !reason) {
      return res.status(400).json({ message: 'billingId, amount, and reason are required' });
    }

    const billing = await Billing.findByPk(billingId);
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    const refund = await Refund.create(addHotelId({
      billingId,
      amount,
      reason,
      refundMethod,
      notes,
      status: 'pending',
    }, req));

    const createdRefund = await Refund.findByPk(refund.id, {
      include: [
        {
          model: Billing,
          as: 'Billing',
          include: [
            { model: Customer, as: 'Customer' },
            { model: Booking, as: 'Booking' },
          ],
        },
      ],
    });

    res.status(201).json(createdRefund);
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({ message: 'Failed to create refund' });
  }
};

exports.updateRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason, status, refundMethod, notes } = req.body;

    const refund = await Refund.findByPk(id);
    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (reason !== undefined) updateData.reason = reason;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'processed') {
        updateData.processedAt = new Date();
        updateData.processedBy = req.user.id;
      }
    }
    if (refundMethod !== undefined) updateData.refundMethod = refundMethod;
    if (notes !== undefined) updateData.notes = notes;

    await refund.update(updateData);

    if (status === 'processed' || status === 'approved') {
      const billing = await Billing.findByPk(refund.billingId);
      if (billing) {
        const newPaidAmount = Math.max(0, billing.paidAmount - refund.amount);
        await billing.update({ paidAmount: newPaidAmount, paymentStatus: 'refunded' });
      }
    }

    const updatedRefund = await Refund.findByPk(id, {
      include: [
        {
          model: Billing,
          as: 'Billing',
          include: [
            { model: Customer, as: 'Customer' },
            { model: Booking, as: 'Booking' },
          ],
        },
        {
          model: User,
          as: 'Processor',
          attributes: ['id', 'username', 'fullName'],
        },
      ],
    });

    res.json(updatedRefund);
  } catch (error) {
    console.error('Error updating refund:', error);
    res.status(500).json({ message: 'Failed to update refund' });
  }
};

exports.deleteRefund = async (req, res) => {
  try {
    const { id } = req.params;

    const refund = await Refund.findByPk(id);
    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    if (refund.status === 'processed') {
      return res.status(400).json({ message: 'Cannot delete a processed refund' });
    }

    await refund.destroy();

    res.json({ message: 'Refund deleted successfully' });
  } catch (error) {
    console.error('Error deleting refund:', error);
    res.status(500).json({ message: 'Failed to delete refund' });
  }
};
