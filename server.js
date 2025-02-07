const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var users = 0;
var test = '/test1';
var mediaFlag = 0;

// Serve static files (including page1.html)
app.use(express.static(__dirname)); 

// Creating a namespace for WebRTC signaling
var nsp = io.of(test);
nsp.on('connection', function (abc) {
    console.log('User connected');
    users++;
    console.log(users);

    abc.on('gotMedia', function () {
        mediaFlag++;
        if (users == 2 && mediaFlag == 2) {
            console.log('Emitting connected event');
            nsp.emit('connected');
        }
        console.log('Got media ' + mediaFlag);
    });

    nsp.emit('callerNum', users);

    abc.on('candidate', function (event) {
        abc.broadcast.emit('candidate', event);
    });

    abc.on('offer', function (event) {
        abc.broadcast.emit('offer', event.sdp);
    });

    abc.on('answer', function (event) {
        abc.broadcast.emit('answer', event.sdp);
    });

    abc.on('disconnect', function () {
        console.log('User disconnected');
        users--;
        console.log(users);
    });
});

// Serve page1.html on both `/test1` and `/page1.html`
app.get(test, (req, res) => {
    res.sendFile(__dirname + '/page1.html');
});

app.get('/page1.html', (req, res) => {
    res.sendFile(__dirname + '/page1.html');
});

// Start server
http.listen(port, function () {
    console.log(`Server running at http://localhost:${port}/page1.html`);
});
