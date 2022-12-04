const initSocket=(io)=>{
    let numberOfClient = 0;
    io.on('connection', socket => {
        numberOfClient++;
        console.log('user connected', socket.id, numberOfClient);
      
        socket.on('chat_room', (data, callback) => {
          const { user, message, room } = data;
          console.log('chat_room', data);
          if (!room) {
            callback('No receive user');
            return;
          }
          io.in(room).emit('chat_room', {
            user: user,
            message,
            room: room,
          });
        });
      
        socket.on('join_room', data => {
          console.log(`${data.user.name} joined room ${data.room}`);
          socket.join(data.room);
        });
        socket.on('leave_room', data => {
          console.log(`${data.user.name} left room ${data.room}`);
          socket.leave(data.room);
        });
      
        socket.on('disconnect', () => {
          numberOfClient--;
          console.log('user disconnected', socket.id);
        });
      });
}
module.exports=initSocket