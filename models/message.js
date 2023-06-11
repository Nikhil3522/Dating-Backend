const mongoose = require('mongoose');
const user_credentials = require('../models/user_credentials');


const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user_credentials',
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user_credentials',
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
