const Message = require('../models/message');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const io = require('socket.io')(8900, {
  cors: {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const users = {};

io.on('connection', socket => {
  socket.on('setUsername', function (username) {
    users[username] = [socket.id, username]; // Store the socket ID along with the username
  });


  socket.on('user_disconnecting', username => {
    if(username){
      if (users.hasOwnProperty(username)) {
        delete users[username];
      }
    }
  });

  // socket.on('disconnect', function() {
  //   console.log('Got disconnect!');
  // });

  socket.on('message', function (data) {
    const { from, to, message, time } = data; // 'to' contains the username/identifier of the recipient
    const recipientSocketId = users[to];

    if (recipientSocketId) {
      // Sender and receiver both are in chat window
      io.to(recipientSocketId).emit('message', {
        from: from, 
        message: message,
        time: time
      });

      Message.create({
        content: message,
        sender: from,
        receiver: to,
        seen: true
      });

    } else {
      // Receiver is not in chat window
      const { from, to, message } = data;

      Message.create({
        content: message,
        sender: from,
        receiver: to,
        seen: false
      });
      
      // socket.emit('error', 'Recipient is not available.');
    }

  });
});

module.exports.getMessages = async function (req, res) {

  const userId = req.user.userId;

  var profileId = req.params.profileId;
  profileId = parseInt(profileId);

  try {
    const PAGE_SIZE = 20;
    const pageNumber = 1; // You can dynamically change the page number based on user interactions.

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: profileId },
        { sender: profileId, receiver: userId },
      ],
    })
      .sort('-createdAt')
      .skip((pageNumber - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate('sender', 'name')
      .populate('receiver', 'name');

    if(messages[0].receiver == userId && messages[0].seen === false){
      const messagesToSeen = await Message.find({
        $or: [
          { sender: userId, receiver: profileId },
          { sender: profileId, receiver: userId },
        ],
        seen: false
      });

      // Update the seen field for each message
      for (const message of messagesToSeen) {
        message.seen = true;
        await message.save();
      }
    }


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
