const Message = require('../models/Message');

/**
 * @desc    Submit a message via the Contact Form
 * @route   POST /api/messages
 * @access  Public
 */
exports.submitMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message fields are strictly required to submit your feedback.'
      });
    }

    const newMessage = await Message.create({
      name,
      email,
      phone,
      subject: subject || 'General Query',
      message,
      isRead: false
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received and our team will get in touch shortly.',
      data: newMessage
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch all customer contact submissions
 * @route   GET /api/messages
 * @access  Private/Admin
 */
exports.getAllMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a message as read/resolved
 * @route   PATCH /api/messages/:id/read
 * @access  Private/Admin
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message record not found' });
    }

    message.isRead = req.body.isRead !== undefined ? req.body.isRead : true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message status updated successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};
