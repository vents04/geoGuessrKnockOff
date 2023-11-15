const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const cors = require('cors');
const mongo = require("./db/mongo");
const indexRoute = require('./routes/index.route');
const errorHandler = require('./errors/errorHandler');
const dotenv = require('dotenv');
dotenv.config();
const io = require("socket.io")(httpServer, { cors: { origin: "*" }, maxHttpBufferSize: 5e+7 });

const { PORT, COLLECTIONS } = require('./global');
const DbService = require('./services/db.service');
const AuthenticationService = require('./services/authentication.service');
const path = require('path');

app
    .use(cors())
    .use(express.json({
        limit: '100mb'
    }))
    .use(express.urlencoded({ extended: true, limit: '100mb' }))
    .use("/", indexRoute)
    .use(errorHandler)
    .use("/public", express.static(path.join(__dirname, 'uploads')));


mongo.connect().then(() => {
    console.log("Connected to database");
});

const socketIdToUserIdMap = new Map();
const rooms = new Array();

function getRoomBySocketId(socketId) {
    if (!socketIdToUserIdMap.has(socketId)) return null;
    const userId = socketIdToUserIdMap.get(socketId);

    for (const room of rooms) {
        for (const user of room.users) {
            if (user._id === userId) {
                return room;
            }
        }
    }
    return null;
}

io.on('connection', (socket) => {
    socket.on('create-room', async ({ token }) => {
        let user = null;
        if (!token) return;

        const verified = AuthenticationService.verifyToken(token);
        if (!verified) return;
        else {
            const user = await DbService.getById(COLLECTIONS.USERS, verified._id);
            if (!user) return;
            if (verified.iat <= new Date(user.lastPasswordReset).getTime() / 1000) return;
        }

        socketIdToUserIdMap.set(socket.id, user._id.toString());

        let finalRoomName = "";
        for (let index = 0; index < 6; index++) {
            finalRoomName += (Math.random() * 10)
        }

        const room = {
            key: finalRoomName,
            users: [user],
            state: "INACTIVE",
            round: 0,
            scores: [],
        }

        rooms.push(room);
        socket.join(finalRoomName);
        socket.to(finalRoomName).emit("room-key", { room });
    });

    socket.on('join-room', async ({ token, roomKey }) => {
        let user = null;
        if (!token) return;

        const verified = AuthenticationService.verifyToken(token);
        if (!verified) return;
        else {
            const user = await DbService.getById(COLLECTIONS.USERS, verified._id);
            if (!user) return;
            if (verified.iat <= new Date(user.lastPasswordReset).getTime() / 1000) return;
        }

        socketIdToUserIdMap.set(socket.id, user._id.toString());

        let room = rooms.filter((room) => { return room.key == roomKey })
        if (!room) return;
        if (room.state == "ACTIVE") return;

        for (let room of rooms) {
            if (room.key == roomKey) {
                room.users.push(user);
            }
        }
        socket.join(roomKey);
        socket.to(roomKey).emit("user-joined", { room })
    });

    socket.on('start-game', async () => {
        let room = getRoomBySocketId(socket.id);
        if (!room) return;

        for (let currRoom of rooms) {
            if (currRoom.key == room.key) {
                currRoom.state = "ACTIVE";
                room = currRoom;
            }
        }

        socket.to(room.key).emit("game-started", { room });
    });

    socket.on('start-round', async () => {
        let room = getRoomBySocketId(socket.id);
        if (!room) return;

        for (let currRoom of rooms) {
            if (currRoom.key == room.key) {
                currRoom.round++;
                room = currRoom;
            }
        }

        socket.to(room.key).emit("round-started", { room });
    });

    socket.on("round-response", async (lon, lat) => {
        let room = getRoomBySocketId(socket.id);
        let userId = socketIdToUserIdMap.get(socket.id);
        if (!room) return;

        for (let currRoom of rooms) {
            if (currRoom.key == room.key) {
                for (let user of currRoom.users) {
                    if (user._id == userId) {
                        currRoom.scores.push({
                            userId,
                            socketId: socket.id,
                            score: lat + lon,
                            round: currRoom.round
                        })
                        if (currRoom.scores == currRoom.users.length * currRoom.round) {
                            socket.to(room.key).emit("round-finished", { room: currRoom });
                            if (currRoom.round == 5) {
                                socket.to(room.key).emit("game-finished", { room: currRoom });
                                currRoom.state = "INACTIVE";
                                currRoom.round = 0;
                                currRoom.scores = [];
                            }
                        }
                    }
                }
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
});

httpServer.listen(PORT, function () {
    console.log("API server listening on port " + PORT)
});