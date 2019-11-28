const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const target = document.getElementById('target-user')
const userName = document.getElementById('current_user')
const directBtn = document.getElementById('send-button')
const broadcastBtn = document.getElementById('broadcast-button')
var name = prompt('What is your name?')
if(!name || name === 'null'){
  name = 'User №' + getRandomInt(1, 2500)
}
userName.value = name
appendActivityMessage('You joined')
socket.emit('new-user', name)

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('chat-single-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendActivityMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendActivityMessage(`${name} disconnected`)
})

broadcastBtn.addEventListener('click', e=>{
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})

directBtn.addEventListener('click', e =>{
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  socket.emit('send-single-message', [message, target.value])
  messageInput.value = ''
})

function appendActivityMessage(message) {
  const messageElement = document.createElement('div')
  const small = document.createElement('small')
  small.innerText = message
  messageElement.append(small)
  messageContainer.append(messageElement)
}

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
