const app = require("./app");
const ioServer = require('socket.io');
const multiplayerGame = require("./socket/multiplayerGame");

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 5005;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});

const io = ioServer(server, {
  cors: {
    credentials: true,
    origin: process.env.ORIGIN || "http://localhost:3000"
  }
});

io.on('connection', client => {
  multiplayerGame.initializeGame(io, client)
});