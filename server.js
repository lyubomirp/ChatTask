const io = require('socket.io')(3000)
const fs = require('fs')
var stream = fs.createWriteStream("message.log")
var express = require('express'),
    app = express(),
    port = process.env.PORT || 4000;

const users = {}
app.use(express.static(__dirname));
app.listen(port);


app.get('*', function(req, res){
  res.sendFile(__dirname + '/index.html'); // change the path to your index.html
});
io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name
    socket.broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', message => {
    write_to_file(users[socket.id] + ' to All' + ': ' + message)
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
  })
  socket.on('send-single-message', data => {
    write_to_file(users[socket.id] + ' to ' + data[1] + ': ' + data[0])
    let target = findId(data[1])
    socket.broadcast.to(target).emit('chat-single-message', {message: data[0], name: users[socket.id] } );
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
  })
})

function findId(name){
  let result;
  Object.keys(users).forEach(function(key) {
    if (users[key] === name){
      result = key;
    }
  });
  return result;
}

function write_to_file(line) {
  var stats = fs.statSync('message.log')
  var datetime = new Date().toLocaleString()
  var msg_size = Buffer.byteLength('[' + datetime + '] ' + line + '\r\n', 'utf8')
  if(stats['size'] + msg_size > 100){
    fs.writeFile('message.log', '[' + datetime + '] ' + line + '\r\n', function(){
      console.log('Filesize exceeded. Writing clean log')
    })
  }else{
    stream.write('[' + datetime + '] ' + line + '\r\n');
  }
}
