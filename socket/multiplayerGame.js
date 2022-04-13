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
    gameSocket.on("playerLeaveRoom", playerLeaveRoom);
    gameSocket.on("deleteRoom", deleteRoom);
    gameSocket.on("disconnect", onDisconnect);
}

function createNewGame(idData) {
    try {
        const thisGameId = (( Math.random() * 100000 ) | 0).toString();

        this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});
    
        this.join(thisGameId);
        usersRoom[thisGameId] = [{username: idData.username, score: 0}];
    
        io.sockets.in(thisGameId).emit('playerJoinedRoom', { usersRoom: usersRoom[thisGameId], gameId: thisGameId});   
    } catch (error) {
        this.emit('error', {errorMessage: "Sorry, something went wrong!"});
    }
}

function playerJoinsGame(idData) {
    try {
        idData.mySocketId = this.id;
        if (!(idData.gameId in usersRoom)) {
            this.emit('error', {errorMessage: "Room not found!"});
            return;
        }
    
        this.join(idData.gameId);
    
        usersRoom[idData.gameId].push({username: idData.username, score: 0});
        idData.usersRoom = usersRoom[idData.gameId];
    
        this.emit('mySocketId', {mySocketId: idData.mySocketId});
    
        io.sockets.in(idData.gameId).emit('playerJoinedRoom', idData);        
    } catch (error) {
        this.emit('error', {errorMessage: "Sorry, something went wrong!"});
    }
}

function startGame(idData) {
    try {
        idData.usersRoom = usersRoom[idData.gameId];
        this.broadcast.in(idData.gameId).emit('gameStarted', idData);            
    } catch (error) {
        this.emit('error', {errorMessage: "Sorry, something went wrong!"});
    }
}

function answerQuestion(idData) {
    try {
        io.sockets.in(idData.gameId).emit('playerAnswered', idData);        
    } catch (error) {
        this.emit('error', {errorMessage: "Sorry, something went wrong!"});
    }
}

function updateScore(idData) {
    try {
        usersRoom[idData.gameId].find(user => user.username === idData.username).score = idData.score;
        idData.usersRoom = usersRoom[idData.gameId];
        io.sockets.in(idData.gameId).emit('scoreUpdated', idData);  
    } catch (error) {
        this.emit('error', {errorMessage: "Sorry, something went wrong!"});
    }
}

function playerLeaveRoom(idData) {
    try {
        this.leave(idData.gameId);
        const i = usersRoom[idData.gameId].findIndex(user => user.username === idData.username);
        usersRoom[idData.gameId].splice(i, 1);
        idData.usersRoom = usersRoom[idData.gameId];
        io.sockets.in(idData.gameId).emit('playerLeavedRoom', idData);   
    } catch (error) {
        this.emit('error', {errorMessage: "Sorry, something went wrong!"});
    }
}

function deleteRoom(idData) {
    try {
        delete usersRoom[idData.gameId];
        this.broadcast.in(idData.gameId).emit('roomDeleted');            
    } catch (error) {
        this.emit('error', {errorMessage: "Sorry, something went wrong!"});
    }
}

function onDisconnect() {
    try {
        const i = gamesInSession.indexOf(gameSocket);
        gamesInSession.splice(i, 1);            
    } catch (error) {
        this.emit('error', {errorMessage: "Sorry, something went wrong!"});
    }
}

exports.initializeGame = initializeGame