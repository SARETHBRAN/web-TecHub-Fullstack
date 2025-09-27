const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const redis = require('redis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3003;

const redisHost = process.env.REDIS_HOST || 'localhost';
const subscriber = redis.createClient({
  host: redisHost,
  port: 6379
});

subscriber.on('error', (err) => {
  console.error('Error en Redis Subscriber:', err);
});

subscriber.on('connect', () => {
  console.log(`Conectado a Redis (${redisHost}) para recibir notificaciones`);
  subscriber.subscribe('cart:updated');
});

const sessions = new Map();

io.on('connection', (socket) => {
  const sessionId = socket.handshake.query.sessionId;
  
  if (sessionId) {
    console.log(`Cliente conectado: ${sessionId}`);
    sessions.set(sessionId, socket.id);
    
    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${sessionId}`);
      sessions.delete(sessionId);
    });
  }
});

subscriber.on('message', (channel, message) => {
  if (channel === 'cart:updated') {
    try {
      const data = JSON.parse(message);
      const socketId = sessions.get(data.sessionId);
      
      if (socketId) {
        io.to(socketId).emit('notification', {
          type: 'cart_update',
          message: `¡${data.quantity} unidad(es) de ${data.productName} añadida(s) al carrito!`,
          productId: data.productId,
          quantity: data.quantity
        });
        console.log(`Notificación enviada a ${data.sessionId}`);
      }
    } catch (err) {
      console.error('Error procesando mensaje de Redis:', err);
    }
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Notification Service activo. Conéctate vía WebSocket.' });
});

server.listen(PORT, () => {
  console.log(`notification-service corriendo en http://localhost:${PORT}`);
  console.log(`WebSocket listo en ws://localhost:${PORT}`);
});