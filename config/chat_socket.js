const Message = require('../models/message');

module.exports.chatSockets = function (socketServer) {
  const io = require('socket.io')(socketServer);

  io.sockets.on('connection', function (socket) {
    console.log('New connection received:', socket.id);

    socket.on('disconnect', function () {
      console.log('Socket disconnected!');
    });

    socket.on('join_room', function (data) {
      socket.join(data.chatRoom);
      console.log('User joined room:', data.chatRoom);
    });

    socket.on('send_message', async function (data) {
      const newMessage = await Message.create({
        content: data.message,
        sender: data.fromUser,
        receiver: data.toUser,
      });

      io.in(data.chatRoom).emit('receive_message', {
        message: newMessage,
      });
    });
  });
};


// module.exports.chatSocket = function(socketServer){
//     let io = require('socket.io')(socketServer);

//     io.sockets.on('connection', function(socket){
//         console.log("new connection received", socket.id);
//     });
// }