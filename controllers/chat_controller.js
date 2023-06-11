const Message = require('../models/message');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports.getMessages = async function (req, res) {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .sort('-createdAt')
      .populate('sender', 'name')
      .populate('receiver', 'name');

    return res.status(200).json({
      success: true,
      messages: messages,
    });
  } catch (err) {
    console.log('Error in fetching messages:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports.sendMessage = async function (req, res) {
  
  try {
    const { content, sender, receiver } = req.body;
    const newMessage = await Message.create({
      content,
      sender,
      receiver,
    });

    // Emit a socket event to notify all connected clients about the new message
    io.emit('newMessage', newMessage);

    return res.status(200).json({
      success: true,
      message: newMessage,
    });
  } catch (err) {
    console.log('Error in sending message:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
