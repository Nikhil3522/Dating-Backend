const mongoose = require('mongoose');
const user_credentials = require('../models/user_credentials');


const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: Number,
      required: true,
    },
    receiver: {
      type: Number,
      required: true,
    },
    seen: {
      type: Boolean,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
