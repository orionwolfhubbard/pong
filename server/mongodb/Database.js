const MongoClient = require('mongodb').MongoClient;
const URL = "DATABASE_URI_HIDDEN";//collections: users, games
const DATABASE = 'MAKE_YOUR_OWN';
const K_VALUE = 50; //for elo

const register = (username, passHash, callback) => {
    MongoClient.connect(URL,(err, db) => {
        if (err) throw err;
        let dbo = db.db(DATABASE);
        dbo.collection('users').findOne({name: username}, function (err, result) {
            if (err) throw err;
            if (!result) {
                dbo.collection('users').insertOne({
                    name: username,
                    pass: passHash,
                    score : 1500,
                }, (err,res) => {
                    if (err) throw err;
                    callback(true);
                    db.close();
                });
            } else {
                callback(false);
                db.close();
            }
        });
    });
};

const login = (username, passHash, callback) => {
    MongoClient.connect(URL,(err, db) => {
        if (err) throw err;
        let dbo = db.db(DATABASE);
        dbo.collection('users').findOne({
            name : username,
        }, (err, res) => {
            if (err) throw err;
            if (!res)
                callback(false);
            else
                callback(res.pass === passHash);
            db.close();
        });
    });
};

//TODO: fix
const updateScores = (loser,winner,callback) => {
    let oldScoreWinner;
    let oldScoreLoser;
    MongoClient.connect(URL, (err,db) => {
        if (err) throw err;
        let dbo = db.db(DATABASE);
        dbo.collection('users').findOne({
            name : winner,
        }, (err,res) => {
            if (err) throw err;
            oldScoreWinner = res.score;
            dbo.collection('users').findOne({
                name : loser,
            },(err,res) => {
                if (err) throw err;
                oldScoreLoser = res.score;
                let winnerExpected = Math.pow(10, oldScoreWinner/400) / (Math.pow(10, oldScoreWinner/400) + Math.pow(10, oldScoreLoser/400));
                let loserExpected = Math.pow(10, oldScoreLoser/400) / (Math.pow(10, oldScoreLoser/400) + Math.pow(10, oldScoreWinner/400));
                let newWinnerRating = oldScoreWinner + K_VALUE *(0 - winnerExpected);
                let newLoserRating = oldScoreLoser + K_VALUE *(1 - loserExpected);
                callback({
                    winner : Math.floor(newLoserRating),
                    loser : Math.floor(newWinnerRating),
                });
                dbo.collection('users').updateOne({name:winner},{$set:{score:newWinnerRating}},(err,res) => {
                    if (err) throw err;
                });
                dbo.collection('users').updateOne({name:loser},{$set:{score:newLoserRating}},(err,res) => {
                    if (err) throw err;
                });
                setTimeout(() => db.close(),1000)
            });
        });
    });
};

const getHighScores = callback => {
    MongoClient.connect(URL, (err,db) => {
        if (err) throw err;
        let dbo = db.db(DATABASE);
        dbo.collection('users').find({}).toArray((err, players) => {
            if (err) throw err;
            dbo.collection('games').find({}).toArray((err,games) => {
                if (err) throw err;
                players.sort((b,a) => a.score - b.score);
                for (let player in players) {
                    let wins = 0;
                    let losses = 0;
                    delete players[player].pass;
                    delete players[player]._id;
                    for (let x in games) {
                        let game = games[x];
                        wins += game.winner === players[player].name ? 1 : 0;
                        losses += game.loser === players[player].name ? 1 : 0;
                    }
                    players[player].wins = wins;
                    players[player].losses = losses;
                }
                callback(players);
                db.close();
            });
        });
    });
};

const recordGame = (winner,loser) => {
    MongoClient.connect(URL, (err,db) => {
        if (err) throw err;
        let dbo = db.db(DATABASE);
        dbo.collection('games').insertOne({winner,loser}, (err,res) => {
            if (err) throw err;
            db.close();
        });
    });
};

module.exports = {login,register,updateScores,recordGame,getHighScores};

