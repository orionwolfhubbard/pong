const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const port = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const Game = require('./Game');
const Database = require('./mongodb/Database');

const userMap = {}; //{username : socketId}
const lobby = []; //[userInLobby,secondUserInLobby, ... ]
const gameMap = {}; //{gameId : gameObj}
const gameIdMap = {}; //{username : gameId}
const observerMap = {};//{username : gameId}

const gamesForLobby = () => {
    let map = {};
    for (let id in gameMap) {
        let obj = {};
        let game = gameMap[id];
        obj.id = game.id;
        obj.rightPlayer = game.rightPlayer;
        obj.leftPlayer = game.leftPlayer;
        map[obj.id] = obj;
    }
    return map;
};

function GameObj(game,leftPlayer,rightPlayer) {
    this.game = game;
    this.leftPlayer = leftPlayer;
    this.rightPlayer = rightPlayer;
    this.id = 'gameId' + Math.random().toString(36).substr(2, 6);
    this.interval = null;
    this.observers = [];
    io.to(userMap[leftPlayer]).emit('start_game');
    io.to(userMap[rightPlayer]).emit('start_game');
}

const updateScores = (winner,loser) => {
    Database.updateScores(winner,loser, scores => {
        let msg1 = `SYSTEM: ${winner} has defeated ${loser}.`;
        let msg2 = `${winner}'s new score is ${scores.winner}`;
        let msg3 = `${loser}'s new score is ${scores.loser}`;
        for (let i in lobby) {
            io.to(userMap[lobby[i]]).emit('chat', msg1);
            io.to(userMap[lobby[i]]).emit('chat', msg2);
            io.to(userMap[lobby[i]]).emit('chat', msg3);
        }
    });
    Database.recordGame(winner,loser);
};

const makeGame = (leftPlayer,rightPlayer) => {
    let game = new Game(who => {
        let gameObj = gameMap[gameIdMap[leftPlayer]];
        clearInterval(gameObj.interval);
        io.to(userMap[leftPlayer]).emit('login', {username:leftPlayer, lobby, state:'lobby'});
        io.to(userMap[rightPlayer]).emit('login', {username:rightPlayer, lobby, state:'lobby'});
        lobby.push(leftPlayer);
        lobby.push(rightPlayer);
        if (gameObj.observers)
            for (let o in gameObj.observers) {
                let observer = gameObj.observers[o];
                delete observerMap[observer];
                lobby.push(observer);
            }
        delete gameIdMap[leftPlayer];
        delete gameIdMap[rightPlayer];
        delete gameMap[gameObj.id];
        if (gameObj.observers)
            for (let o in gameObj.observers) {
                let name = gameObj.observers[o];
                io.to(userMap[name]).emit('login', {username:name, lobby, state:'lobby'});
            }
        for (let i in lobby)
            io.to(userMap[lobby[i]]).emit('lobby', {lobby,gameMap:gamesForLobby()});
        if (who === 'left')
            updateScores(rightPlayer,leftPlayer);
        else updateScores(leftPlayer,rightPlayer);
    });
    let gameObj = new GameObj(game,leftPlayer,rightPlayer);
    gameIdMap[leftPlayer] = gameObj.id;
    gameIdMap[rightPlayer] = gameObj.id;
    gameMap[gameObj.id] = gameObj;
    lobby.splice(lobby.indexOf(leftPlayer),1);
    lobby.splice(lobby.indexOf(rightPlayer),1);
    for (let i in lobby)
        io.to(userMap[lobby[i]]).emit('lobby', {lobby,gameMap:gamesForLobby()});
};

const startGame = gameObj => {
    io.to(userMap[gameObj.leftPlayer]).emit('start_game');
    io.to(userMap[gameObj.rightPlayer]).emit('start_game');
    gameObj.game.start();
    gameObj.interval = setInterval(() => {
        let state = gameObj.game.getState();
        io.to(userMap[gameObj.leftPlayer]).emit('update_game',state);
        io.to(userMap[gameObj.rightPlayer]).emit('update_game',state);
        if (gameObj.observers)
            for (let o in gameObj.observers)
                io.to(userMap[gameObj.observers[o]]).emit('update_game',state);
    },10);
};

const hash = s => {
    //algorithm hiddin
    return s;
};

io.on('connection', socket => {

    let username = '';

    socket.on('register', data => {
        if (!(new RegExp('^[a-zA-Z]{3,10}$').test(data.name)))
            socket.emit('login_msg', {msg:'invalid username, must be 3-10 letters only',color:'red'});
        else {
            data.pass = hash(data.pass);
            Database.register(data.name, data.pass, result => socket.emit('register', result));
        }
    });

    socket.on('login', data => {
        if (data.name in userMap)
            socket.emit('login_msg', {msg:data.name + ' is already logged in',color:'red'});
        else {
            data.pass = hash(data.pass);
            Database.login(data.name, data.pass, bool => {
                if (bool) {
                    userMap[data.name] = socket.id;
                    lobby.push(data.name);
                    username = data.name;
                    socket.emit('login', {username,lobby,state:'lobby'});
                    for (let i in lobby)
                        io.to(userMap[lobby[i]]).emit('lobby', {lobby,gameMap:gamesForLobby()});
                } else
                    socket.emit('login_msg', {msg:'Bad login data provided.',color:'red'});
            });
        }
    });
    
    socket.on('request_game', name => {
        if (username) {
            io.to(userMap[name]).emit('request', username);
        }
    });
    
    socket.on('chat', text => {
        if (username) {
            for (let i in lobby)
                io.to(userMap[lobby[i]]).emit('chat', username + ': ' + text);
        }
    });
    
    socket.on('accept', name => {
        if (username) {
            if (lobby.indexOf(name) !== -1)
                makeGame(username, name);
            else socket.emit('chat', `SYSTEM: ${name} is no longer in the lobby.`);
        }
    });
    
    socket.on('decline', name => {
        if (username) {
            if (lobby.indexOf(name) !== -1)
                io.to(userMap[name]).emit('chat', `SYSTEM: ${username} has declined your invitation.`);
        }
    });

    socket.on('move_paddle', string => {
        if (username) {
            let gameObj = gameMap[gameIdMap[username]];
            if (gameObj.leftPlayer === username)
                gameObj.game.moveLeftPaddle(string);
            else
                gameObj.game.moveRightPaddle(string);
            io.to(userMap[gameObj.leftPlayer]).emit('update_game', gameObj.game.getState());
            io.to(userMap[gameObj.rightPlayer]).emit('update_game', gameObj.game.getState());
        }
    });
    
    socket.on('start_game', () => {
        if (username) {
            let gameObj = gameMap[gameIdMap[username]];
            if (!gameObj.interval)
                startGame(gameObj);
        }
    });
    
    socket.on('get_scores', () => Database.getHighScores(scores => socket.emit('scores', scores)));
    
    socket.on('observe', gameId => {
        if (gameId in gameMap) {
            observerMap[username] = gameId;
            let gameObj = gameMap[gameId];
            socket.emit('observe', {
                left : gameObj.leftPlayer,
                right : gameObj.rightPlayer,
            });
            if (!gameObj.observers)
                gameObj.observers = [];
            gameObj.observers.push(username);
            let index = lobby.indexOf(username);
            if (index !== -1) {
                lobby.splice(index,1);
                for (let i in lobby)
                    io.to(userMap[lobby[i]]).emit('lobby', {lobby,gameMap:gamesForLobby()});
            }
        }
    });
    
    socket.on('disconnect', () => {
        if (username) {
            if (username in observerMap)
                gameMap[observerMap[username]].observers
                    .splice(gameMap[observerMap[username]].observers.indexOf(username));
            delete userMap[username];
            if (username in gameIdMap) {
                let gameObj = gameMap[gameIdMap[username]];
                gameObj.game.stop();
                if (gameObj.interval)
                    clearInterval(gameObj.interval);
                if (gameObj.leftPlayer === username)
                    updateScores(gameObj.rightPlayer,gameObj.leftPlayer);
                else updateScores(gameObj.leftPlayer,gameObj.rightPlayer);
                delete gameIdMap[gameObj.leftPlayer];
                delete gameIdMap[gameObj.rightPlayer];
                delete gameMap[gameObj.id];
            }
            let index = lobby.indexOf(username);
            if (index !== -1) {
                lobby.splice(index,1);
                for (let i in lobby)
                    io.to(userMap[lobby[i]]).emit('lobby', {lobby,gameMap:gamesForLobby()});
            }
        }
    });
    


});

server.listen(port, () => console.log(`Listening on port ${port}`));
