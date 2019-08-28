const socket = io();

socket.on('message', (message) => {
	console.log(message);
});

document.querySelector('#send-message').addEventListener('submit', (e) => {
	e.preventDefault();
	const message = e.target.elements.message.value;

	socket.emit('sendMessage', message, (error) => {
		error ? console.log(error) : console.log('Message delivered');
	});
});

document.querySelector('#send-location').addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Geolocation is not supported');
	}

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			'sendLocation',
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			},
			() => {
				console.log('Location shared!');
			}
		);
	});
});
