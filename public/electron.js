const WebSocket = require('ws');
const server = new WebSocket.Server({
    port: 3002
});

const electronHandler = require("./electronHandler.js");
const readline = require('readline');
let rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

new electronHandler.Main();



let sockets = [];
server.on('connection', function(socket) {
    console.log("tu")
    sockets.push(socket);

    // When you receive a message, send that message to every socket.
    socket.on('message', function(msg) {
        console.log("msg")
        console.log(msg.toString())
        sockets.forEach(s => s.send(msg));
    });

    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function() {
        console.log("close")
        sockets = sockets.filter(s => s !== socket);
    });
});

//
rl.on('line', function(line){ console.log("RECEIVED:" + line); })