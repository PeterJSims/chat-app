const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

//server(emit) -> client(receive) -> acknowledgement -> countUpdated
//client(emit) -> server(receive) -> acknowledgement -> increment

io.on('connection', (socket) => {
	console.log('new socket connection');

	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit('message', generateMessage('Welcome!'));
		socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the room`));

		callback();
	});

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback('No profanity!');
		}
		io.to('a').emit('message', generateMessage(message));
		callback('Delivered');
	});

	socket.on('sendLocation', (obj, callback) => {
		io.emit(
			'locationMessage',
			generateLocationMessage(`https://google.com/maps?q=${obj.latitude},${obj.longitude}`)
		);
		callback();
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit('message', generateMessage(`${user.username} has left the room`));
		}
	});
});

server.listen(port, () => {
	console.log(`Server is up on ${port}`);
});
