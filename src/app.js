const PORT = process.env.PORT || 3000;

const express = require('express');
const session = require('express-session');
const sessionConfig = session({
    secret: 'secret thing',
    resave: false,
    saveUninitialized: true,
});

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const bcrypt = require('bcryptjs');

const gameServe = require('./game.js');

require('./db.js');
const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const Player = mongoose.model('Player');

const passport = require('passport');
require('../passport.config.js')(passport);

if (process.env.NODE_ENV === 'development') {
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const webpackConfig = require('../webpack.config.js')
  const webpack = require("webpack");
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
      publicPath:'/javascripts'
  }));
}

app.use(
  express.static('public'),
  express.json(),
  express.urlencoded({ extended: false }),
  sessionConfig,
  passport.initialize(),
  passport.session(),
  (req, res, next) => {
    if (req.method === 'GET') {
      res.sendFile(path.join(__dirname, '..', 'public', 'index.html'), (err) => {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        }
      });
    } else {
      next();
    }
  }
);

// https://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io
io.use((socket, next) => {
  sessionConfig(socket.request, {}, next);
})

// https://stackoverflow.com/questions/21855650/passport-authenticate-callback-is-not-passed-req-and-res
app.post('/login', (req, res) => {
  passport.authenticate('local-login', (err, user, message) => {
    if (err) {
      console.log(err);
      return res.status(500).send();
    } else if (!user) {
      return res.status(303).send(message);
    } else {
      req.login(user, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send();
        }
        return res.status(200).json({username: user.username});
      });
    }
  })(req, res);
});

app.post('/register', (req, res) => {
  passport.authenticate('local-signup', (err, user, message) => {
    if (err) {
      console.log(err);
      return res.status(500).send();
    } else if (!user) {
      return res.status(303).send(message);
    } else {
      req.login(user, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send();
        }
        return res.status(200).json({username: user.username});
      });
    }
  })(req, res);
});

app.post('/logout', (req, res) => {
  if (req.body.username === req.user.username) {
    req.logout();
    res.status(200).send();
  } else {
    res.status(303).send();
  }
});

app.post('/user/:username', (req, res) => {
  if (req.user.username === req.params.username) {
    req.user.description = req.body.description;
    req.user.save((err, player) => {
      if (err) {
        res.status(500).send();
      } else {
        res.status(200).send();
      }
    });
  } else {
    res.status(303).send();
  }
});

app.post('/game/create', (req, res) => {
  if (req.user.game) {
    res.status(303).send({message: 'You are already in a game.'});
  } else {
    Game.findOne({name: req.body.name}).exec()
      .then(game => {
        if (game) {
          res.status(303).send({message: 'Name already exists.'});
        } else {
          return bcrypt.hash((req.body.password || ''), 10)
            .then(hash => {
              const details = req.body;
              details.players = [];
              details.players.push(req.user.username); //add user to game, if below fails to save then we are in trouble
              if (details.password) {
                details.password = hash;
              }
              return new Game(details).save();
            })
            .then(game => {
              req.user.game = game._id;
              return req.user.save().then(_ => {
                res.status(200).send(game);
                io.emit('receive-game', JSON.stringify(game));
                new gameServe.Server(io, io.of('/'+game._id), game).add(req.user.username);
              });
            })
            .catch(err => {
              console.log(err);
              res.status(500).send();
            });
        }
      });
  }
});

app.post('/game/join', (req, res) => {
  Game.findOne({slug: req.body.slug}).exec()
    .then(game => {
      if (req.user.game) {
        if (req.user.game.equals(game._id)) {
          if (!gameServe.find(game._id)) {
            new gameServe.Server(io, io.of('/'+game._id), game);
          }
          res.status(200).send();
        } else {
          res.status(303).send({message: 'You are already in a game.'});
        }
      } else {
        return bcrypt.compare((req.body.password || ''), (game.password || ''))
          .then(match => {
            if (!game.password || match) {
              game.players.push(req.user.username);
              return game.save().then(game => { // again, save the game first
                req.user.game = game._id;
                return req.user.save().then(_ => {
                  res.status(200).send();
                  if (!gameServe.find(game._id)) {
                    new gameServe.Server(io, io.of('/'+game._id), game).add(req.user.username);
                  } else {
                    gameServe.find(game._id).add(req.user.username);
                  }
                  io.emit('receive-update', JSON.stringify(game));
                });
              })
            } else {
              res.status(303).send({message: 'Wrong password.'});
            }
          });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send();
    });
});

app.post('/game/leave', (req, res) => {
  req.user.game = null;
  req.user.save()
    .then(_ => {
      if (req.body.delete) {
        Game.findOneAndRemove({slug: req.body.slug}).exec().then(
          game => {
            res.status(200).send();
            if (io.nsps['/'+game._id]) {
              delete io.nsps['/'+game._id];
              gameServe.remove(game._id);
            } else {
              console.log('Could not remove ' + game._id + ' from namespaces');
            }
            io.emit('receive-removal', JSON.stringify(game));
        });
      } else {
        return Game.findOne({slug: req.body.slug}).exec();
      }
    })
    .then(game => {
      if (game) {
        game.players.splice(game.players.indexOf(req.user.username), 1);
        return game.save()
          .then(_ => {
            res.status(200).send();
            io.emit('receive-update', JSON.stringify(game));
            if (gameServe.find(game._id)) {
              gameServe.find(game._id).remove(req.user.username);
            }
          });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send();
    });
});

io.on('connection', (socket) => {
  let user;
  // TODO: this is to avoid losing the user on refresh...should be a better way
  socket.on('check-login', _ => {
    if (user) {
      socket.emit('check-login', user.username);
    } else if (socket.request.session.passport) {
      Player.findById(mongoose.Types.ObjectId(socket.request.session.passport.user), (err, player) => {
        if (err) {
          console.log(err);
        } else if (!player) {
          user = null;
          socket.emit('check-login', '');
        } else {
          user = player;
          socket.emit('check-login', user.username);
        }
      });
    } else {
      user = null;
      socket.emit('check-login', '');
    }
  });

  socket.on('get-game-all', _ => {
    Game.find({started: false}, (err, games) => {
      if (err) {
        console.log(err);
      } else {
        socket.emit('receive-game-all', JSON.stringify(games));
      }
    });
  });

  socket.on('get-game-details', data => {
    const info = JSON.parse(data);
    Game.findOne({slug: info.slug}, (err, game) => {
      if (err) {
        console.log(err);
      } else if (!game || !game.players.includes(info.username)) {
        socket.emit('receive-game-details', '');
      } else {
        if (!gameServe.find(game._id)) {
          new gameServe.Server(io, io.of('/'+game._id), game);
        }
        socket.emit('receive-game-details', JSON.stringify(game));
      }
    });
  })

  socket.on('get-wins', _ => {
    Player.find().sort({'roundWins': -1}).limit(3).exec((err, rounds) => {
      if (err) {
        console.log(err);
      } else {
        socket.emit('receive-wins-round', JSON.stringify(rounds.map(round => {
          return {
            username: round.username,
            wins: round.roundWins
          };
        })));
      }
    });

    Player.find().sort({'gameWins': -1}).limit(3).exec((err, games) => {
      if (err) {
        console.log(err);
      } else {
        socket.emit('receive-wins-game', JSON.stringify(games.map(game => {
          return {
            username: game.username,
            wins: game.gameWins
          };
        })));
      }
    });
  });

  socket.on('get-user', data => {
    const { visitor, visitee } = JSON.parse(data);
    Player.findOne({username: visitee}, (err, player) => {
      if (err) {
        console.log(err);
      } else if (!player) {
        socket.emit('receive-user', JSON.stringify({error: 'User does not exist.'}));
      } else {
        let playedWith = 0;
        player.usersPlayedWith.some(user => {
          if (user.user === visitor) {
            playedWith = user.times;
            return true;
          }
          return false;
        });

        socket.emit('receive-user', JSON.stringify({
          username: player.username,
          roundWins: player.roundWins,
          gameWins: player.gameWins,
          playedWith: playedWith,
          description: player.description
        }));
      }
    });
  });
});

server.listen(PORT);
