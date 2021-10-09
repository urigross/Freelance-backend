const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null

function connectSockets(http, session) {
    gIo = require('socket.io')(http);
    const sharedSession = require('express-socket.io-session');

    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        console.log('New socket - socket.handshake.sessionID', socket.handshake.sessionID)
        _printSocket(socket);
        // if (socket.handshake?.session?.user) socket.join(socket.handshake.session.user._id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
        })
        socket.on('chat topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            // logger.debug('Session ID is', socket.handshake.sessionID)
            socket.myTopic = topic
        })
        socket.on('chat newMsg', msg => {
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            gIo.to(socket.myTopic).emit('chat addMsg', msg)
        })
        socket.on('user-watch', userId => {
            socket.join(userId)
        })

    })
}

function emitToAll({ type, data, room = null }) {
    if (room) gIo.to(room).emit(type, data)
    else gIo.emit(type, data)
}

// TODO: Need to test emitToUser feature
function emitToUser({ type, data, userId }) {
    const sockets = _getAllSockets()
    const socket = sockets.find(s => s.handshake?.session?.user?._id == userId)
    // const socket = sockets.find(s => {
    //     // if (!s.handshake) return logger.debug('No handshake')
    //     // if (!s.handshake.session) return logger.debug('No handshake.session')
    //     // if (!s.handshake.session.user) return logger.debug('No handshake.session.user')
    //     // return s.handshake.session.user._id === userId
    // })
    if (!socket) {
        logger.debug('Socket not found for user: ' + userId)
        _printSockets();
        return
    }
    logger.debug('Emiting to user socket: ' + userId)
    socket.emit(type, data)
}


// Send to all sockets BUT not the current socket 
function broadcast({ type, data, room = null }) {
    const store = asyncLocalStorage.getStore()
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')

    const sockets = _getAllSockets()
    const excludedSocket = sockets.find(socket => socket.handshake.sessionID === sessionId)
    if (!excludedSocket) {
        logger.debug('Shouldnt happen, socket not found')
        _printSockets();
        return;
    }
    logger.debug('broadcast to all but session: ', sessionId)
    if (room) {
        excludedSocket.broadcast.to(room).emit(type, data)
    } else {
        excludedSocket.broadcast.emit(type, data)
    }
}

function _getAllSockets() {
    const socketIds = Object.keys(gIo.sockets.sockets)
    const sockets = socketIds.map(socketId => gIo.sockets.sockets[socketId])
    return sockets;
}

function _printSockets() {
    const sockets = _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    var msg = 'Socket - sessionId:' + socket.handshake.sessionID
    if (socket.handshake.session.user) {
        const {user} = socket.handshake.session
        msg += ` With session for user: ${user.fullname} (_id=${user._id})`
    }
    console.log(msg)
}

module.exports = {
    connectSockets,
    emitToAll,
    emitToUser,
    broadcast,
}



