let io;
let gameSocket;
let gamesInSession = [];
let usersRoom = {};

const initializeGame = (sio, socket) => {
    io = sio;
    gameSocket = socket;

    gamesInSession.push(gameSocket);

    gameSocket.on("createNewGame", createNewGame);
    gameSocket.on("playerJoinGame", playerJoinsGame);
    gameSocket.on("startGame", startGame);
    gameSocket.on("answerQuestion", answerQuestion);
    gameSocket.on("updateScore", updateScore);
    gameSocket.on("disconnectGame", onDisconnect);
}

function createNewGame(idData) {
    const thisGameId = (( Math.random() * 100000 ) | 0).toString();

    this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

    this.join(thisGameId);
    usersRoom[thisGameId] = [{username: idData.username, score: 0}];

    io.sockets.in(thisGameId).emit('playerJoinedRoom', { usersRoom: usersRoom[thisGameId]});
}

function playerJoinsGame(idData) {
    idData.mySocketId = this.id;

    if (!usersRoom[idData.gameId]) return;

    this.join(idData.gameId);

    usersRoom[idData.gameId].push({username: idData.username, score: 0});
    idData.usersRoom = usersRoom[idData.gameId];

    io.sockets.in(idData.gameId).emit('playerJoinedRoom', idData);
}

function startGame(idData) {
    idData.usersRoom = usersRoom[idData.gameId];
    this.broadcast.in(idData.gameId).emit('gameStarted', idData);
}

function answerQuestion(idData) {
    io.sockets.in(idData.gameId).emit('playerAnswered', idData);
}

function updateScore(idData) {
    usersRoom[idData.gameId].find(user => user.username === idData.username).score = idData.score;
    idData.usersRoom = usersRoom[idData.gameId];
    io.sockets.in(idData.gameId).emit('scoreUpdated', idData);
}

function onDisconnect(idData) {
    this.leave(idData.gameId);
    usersRoom[idData.gameId] = null;
    const i = gamesInSession.indexOf(gameSocket);
    gamesInSession.splice(i, 1);
}

exports.initializeGame = initializeGame