let io;
let gameSocket;
let gamesInSession = [];
let usersRoom = [];

const initializeGame = (sio, socket) => {
    io = sio;
    gameSocket = socket;

    gamesInSession.push(gameSocket);

    gameSocket.on("createNewGame", createNewGame);
    gameSocket.on("playerJoinGame", playerJoinsGame);
    gameSocket.on("startGame", startGame);
    gameSocket.on("answerQuestion", answerQuestion);
    
    // Run code when the client disconnects from their socket session. 
    gameSocket.on("disconnect", onDisconnect);
}

function createNewGame(idData) {
    const thisGameId = (( Math.random() * 100000 ) | 0).toString();

    this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

    this.join(thisGameId);
    usersRoom[thisGameId] = [idData.username];

    io.sockets.in(thisGameId).emit('playerJoinedRoom', { usersRoom: usersRoom[thisGameId]});
}

function playerJoinsGame(idData) {
    idData.mySocketId = this.id;

    this.join(idData.gameId);

    if (!usersRoom[idData.gameId.toString()]) return;

    usersRoom[idData.gameId.toString()].push(idData.username);
    idData.usersRoom = usersRoom[idData.gameId.toString()];

    io.sockets.in(idData.gameId).emit('playerJoinedRoom', idData);
}

function startGame(idData) {
    idData.usersRoom = usersRoom[idData.gameId.toString()];
    this.broadcast.in(idData.gameId).emit('gameStarted', idData);
}

function answerQuestion(idData) {
    io.sockets.in(idData.gameId).emit('playerAnswered', idData);
}

function onDisconnect() {
    const i = gamesInSession.indexOf(gameSocket);
    gamesInSession.splice(i, 1);
}

exports.initializeGame = initializeGame