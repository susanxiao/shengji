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
  passport.session()
);

// https://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io
io.use((socket, next) => {
  sessionConfig(socket.request, {}, next);
})

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

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

    // .on("connection", function(socket){
    //     var userId = socket.request.session.passport.user;
    //     console.log("Your User ID is", userId);
    // });

io.on('connection', (socket) => {
  socket.on('get-game-all', _ => {
    Game.find({started: false}, (err, games) => {
      if (err) {
        console.log(err);
      } else {
        socket.emit('get-game-all', JSON.stringify(games));
      }
    });
  });
});

server.listen(3000);
