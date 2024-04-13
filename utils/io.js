const socketIo = require('socket.io');

let io;

function initializeSocket(server) {
    io = socketIo(server);
    return io;
}

function getIO() {
    if (!io) {
        throw new Error('Socket.IO 尚未初始化');
    }
    return io;
}

module.exports = {
    initializeSocket,
    getIO
};
