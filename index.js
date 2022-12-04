const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const mongoose = require('mongoose');
const app = express();
const initRoute = require('./src/routes');
const initSocket = require('./src/routes/socket');

const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(
  express.urlencoded({
    limit: '30mb',
    extended: true,
  })
);
app.use(
  express.json({
    limit: '30mb',
    extended: true,
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});




initRoute(app);
initSocket(io)


mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log('Server is running on port ' + PORT);
    });
  })
  .catch(error => {
    console.log('error', error.message);
  });
