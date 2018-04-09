require('./db.js');

const express = require('express');
const path = require('path');
const session = require('express-session');

const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const Player = mongoose.model('Player');

const app = express();

const passport = require('passport');
require('./passport-config.js')(passport);
const flash = require('connect-flash');

app.set('view engine', 'hbs');

app.use(
  express.static(path.join(__dirname, '..', 'public')),
  express.urlencoded({ extended: false }),
  session({
      secret: 'secret thing',
      resave: false,
      saveUninitialized: true,
  }),
  flash(),
  passport.initialize(),
  passport.session(),
  (req, res, next) => {
    if (req.isAuthenticated()) {
      res.locals.loggedIn = true;
      res.locals.username = req.user.username;
    } else {
      res.locals.loggedIn = false;
      delete res.locals.username;
    }
    next();
});

app.get('/', (req, res) => {
  Game.find({started: false}, (err, games) => {
    res.render('index.hbs', { games: games });
  });
});

app.get('/login', (req, res) => {
  const message = req.flash('error')[0];
  res.render('login.hbs', { message: message });
});

app.get('/register', (req, res) => {
  const message = req.flash('error')[0];
  res.render('register.hbs', { message: message });
})

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/scoreboard', (req, res) => {
  // reference: https://docs.mongodb.com/manual/reference/method/cursor.sort/
  // reference: https://stackoverflow.com/questions/5830513/how-do-i-limit-the-number-of-returned-items
  Player.find().sort({'roundWins': -1}).limit(3).exec((err, rounds) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      Player.find().sort({'gameWins': -1}).limit(3).exec((err1, games) => {
        if (err1) {
          console.log(err1);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('scoreboard.hbs', {
            rounds: rounds.map(round => {
              return {
                username: round.username,
                wins: round.roundWins
              };
            }),
            games: games.map(game => {
              return {
                username: game.username,
                wins: game.gameWins
              };
            })
          });
        }
      });
    }
  });
});

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.post('/register', passport.authenticate('local-signup', {
  successRedirect : '/',
  failureRedirect : '/register',
  failureFlash : true
}));

/*
* /
  * make a new game -> popup with form to create new game
      * create -> POST req to create the game, redirect to '/game/[game-slug]'
  * join game -> popup with password and/or join button
      * join (SUCCESS) -> redirect to '/game/[game-slug]'
      * join (FAIL) -> reload with error message
  * [username] -> '/user/[username]'
* /game/[game-slug]
  * start (disabled until # players >= 4) -> reload page
  * delete game -> redirect to '/', deletes game
  * [username] -> popup with cards that player has played
  * [points collected] -> popup with cards that have been collected
  * end game -> redirects all players to '/', saves game
* /user/[username]
  * edit (for own page) -> reload with bio as text input & option to save
  * rejoin (for own page) -> redirect to '/game/[game-slug]'
*/

app.listen(3000);
