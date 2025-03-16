const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/config');
const { setupAssociations } = require('./models/Post');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure CORS for both REST and Socket.IO
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://week8assignment-frontend.onrender.com', 'http://week8assignment-frontend.onrender.com'] 
    : 'http://localhost:3000',
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions
});

app.use(express.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Setup model associations
setupAssociations();

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 3001;

// Test database connection and sync models
const startServer = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync the models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');

    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
    // Wait 5 seconds before exiting to allow logs to be captured
    setTimeout(() => process.exit(1), 5000);
  }
};

startServer();
