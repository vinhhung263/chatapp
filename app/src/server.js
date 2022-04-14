const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { createMessage } = require("./utils/create-messages");
const { getUserList, addUser, removeUser, findUser } = require("./utils/users");

const filter = new Filter();
filter.addWords('dmm', 'vcl');
const port = process.env.PORT || 4567;

const publicPathDirectory = path.join(__dirname, "../public");
const app = express();
app.use(express.static(publicPathDirectory));
const HTTPServer = http.createServer(app);
const ioServer = socketio(HTTPServer);

// socketServer.broadcast.to => to others
// ioServer.to => to all
ioServer.on("connection", (socketServer) => {
    socketServer.on("Client-joined-room", ({ room, username }) => {
        const idSocketServer = socketServer.id;
        const user = { id: idSocketServer, username, room };
        addUser(user);

        socketServer.join(room);
        socketServer.emit("Server-sent-message",
            createMessage(`Chào mừng bạn đến với phòng ${room}`, "Admin"));
        socketServer.broadcast.to(room).emit("Server-sent-message",
            createMessage("Có 1 client vừa tham gia Chat App", "Admin"));
        ioServer.to(room).emit("Server-updated-user-list", getUserList(room));

        // Chatting
        socketServer.on("Client-sent-message", (messageText, callback) => {
            if (filter.isProfane(messageText)) return callback("Message không hợp lệ");
            ioServer.to(room).emit("Server-sent-message", createMessage(messageText, user.username));
            callback();
        });
        socketServer.on("Client-shared-location", ({ latitude, longitude }) => {
            const linkLocation = `https://maps.google.com/?q=${latitude},${longitude}`;
            ioServer.to(room).emit("Server-shared-location", createMessage(linkLocation, user.username));
        });

        // Disconnection
        socketServer.on("disconnect", () => {
            removeUser(user.id);
            ioServer.to(room).emit("Server-updated-user-list", getUserList(room));
            socketServer.broadcast.to(room).emit("Server-sent-message", createMessage("Có 1 client vừa rời khỏi phòng Chat", "Admin"));
        });
    });
});

HTTPServer.listen(port, () => {
    console.log(`App run on http://localhost:${port}`);
});