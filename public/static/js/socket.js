var socket = io.connect('http://localhost:3000',{ 'forceNew': true })
var socket = io();

socket.on('ico_status', function(msg){
    console.log('message: ' + msg);
});

socket.on('messages', (data)=>{
	render(data)
});

