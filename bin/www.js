#!/usr/bin/env node

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();
const app = require('../app');
const debug = require('debug')('mining-company-management-system-backend:server');
const http = require('http');

mongoose.connect(process.env.MONGO_URL, {dbName: "mining-company-management-system"})
    .then(() => console.log("database connection successful"))
    .catch(err => console.log(err.message))

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
// Create a Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let inactiveUsers = [];
let activeUsers = [];
io.on('connection', (socket) => {

  socket.on('new-user-add', (newUserId) => {
    if (!activeUsers.some(user => user.userId === newUserId)) {
      activeUsers.push(
          {
            userId: newUserId,
            socketId: socket.id
          }
      )
    }
    console.log(activeUsers);
    io.emit('get-users', activeUsers);
  })

  socket.on('send-message', data => {
    const { receiverId } = data;
    const activeUser = activeUsers.find(user => user.userId === receiverId);
    // const inactiveUser = inactiveUsers.find(user => user.userId === receiverId);
    if (activeUser) {
      io.to(activeUser.socketId).emit('receive-message', data);
    }
  })

  socket.on('current-typing', data => {
    console.log('event received');
    console.log(data);
    const { receiverId } = data;
    const activeUser = activeUsers.find(user => user.userId === receiverId);
    if (activeUser) {
      io.to(activeUser.socketId).emit('typing', data);
    }
  })

  // socket.on('register-conversation', newUserId => {
  //   if (!activeUsers.some(user => user.userId === newUserId) && !inactiveUsers.some(user => user.userId === newUserId)) {
  //     inactiveUsers.push(
  //         {
  //           userId: newUserId,
  //           socketId: socket.id
  //         }
  //     )
  //   }
  // })

  // Handle specific events here and emit data to clients as needed
  // For example, when a new operation is recorded:
  // socket.on('newOperation', (data) => {
  //   io.emit('operationUpdate', data);
  // });

  socket.on('disconnect', () => {
    activeUsers  = activeUsers.filter(user => user.socketId !== socket.id);
    io.emit('get-users', activeUsers);
  });
});
/**
 * Listen on provided port, on all network interfaces.
 */



server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
