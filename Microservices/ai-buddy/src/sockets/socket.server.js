const { Server, Socket } = require("socket.io");
const jwt = require('jsonwebtoken');
const cookie = require('cookie')

async function initSocketServer(httpServer) {

    const io = new Server(httpServer, {})

    io.use((socket, next) => {

        const cookies = socket.handshake.headers?.cookie;

        /* const { token } = cookies ? cookie.parseCookie(cookies) : {}; Use this in new Version of cookie */

        const { token } = cookies ? cookie.parse(cookies) : {};  /* used older version of cookie */

        if (!token) {
            return next( new Error('Token not provided'))
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            socket.user = decoded;

            next();

        } catch (err) {
            next(new Error('Invalid token'))
        }
    })

    io.on('connection', (socket) => {
        console.log("A user connected")
    })
}


module.exports = { initSocketServer }