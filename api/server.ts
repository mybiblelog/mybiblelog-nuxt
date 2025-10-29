#!/usr/bin/env node

import http from 'node:http';
import debug from 'debug';

import config from './config';
import useMongooseModels from './mongoose/useMongooseModels';
import initReminderService from './services/reminder.service';
import buildApp from './app';

// Normalize a port into a number, string, or false.
const normalizePort = (val: string) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val; // named pipe
  }
  if (port >= 0) {
    return port; // port number
  }
  return false;
};

// Event listener for HTTP server "error" event.
const onError = (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind =
    typeof port === 'string' ?
      'Pipe ' + port :
      'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges'); // eslint-disable-line no-console
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use'); // eslint-disable-line no-console
      process.exit(1);
    default:
      throw error;
  }
};

// Event listener for HTTP server "listening" event.
const onListening = (server: http.Server) => () => {
  const addr = server.address()!;
  const bind =
    typeof addr === 'string' ?
      'pipe ' + addr :
      'port ' + addr.port;
  debug('Listening on ' + bind);
};

// Get port from environment and store in Express.
const port = normalizePort(config.apiPort || '8080');

const startServer = async () => {
  // make sure mongoose is connected
  useMongooseModels();
  await initReminderService();
  const app = buildApp();

  app.set('port', port);

  // Create HTTP server.
  const server = http.createServer(app);

  // Listen on provided port, on all network interfaces.
  server.on('error', onError);
  server.on('listening', onListening(server));
  server.listen(port);
};

startServer();
