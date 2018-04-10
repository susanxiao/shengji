const PORT = process.env.PORT || 3000;

require('./db.js');

const express = require('express');
const path = require('path');
const session = require('express-session');

const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const Player = mongoose.model('Player');

const app = express();

const passport = require('passport');
require('./passport-config.js')(passport);
const flash = require('connect-flash');

const hbs = require('hbs');
app.set('view engine', 'hbs');
// reference: https://stackoverflow.com/questions/8059914/express-js-hbs-module-register-partials-from-hbs-file/12700409#12700409
hbs.registerPartials(path.join(__dirname, '..', 'views', 'partials'));

app.use(
  express.json(),
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
    if (res.locals.loggedIn) {
      res.render('index.hbs', { games: games, scripts: ['javascripts/create.js'] });
    } else {
      res.render('index.hbs', { games: games, scripts: ['javascripts/login.js']});
    }
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
      Player.find().sort({'gameWins': -1}).limit(3).exec((err, games) => {
        if (err) {
          console.log(err);
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

// not finished!!
app.get('/game/:game', (req, res) => {
  const game = req.params.game;
  Game.findOne({slug: game}, (err, game) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else if (game) {
      res.render('game.hbs', {name: game.name});
    } else {
      res.render('game.hbs', {name: 'not found'});
    }
  });
});

// not finished!
app.get('/user/:username', (req, res) => {
  const username = req.params.username;
  Player.findOne({username: username}, (err, player) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else if (player) {
      res.render('user.hbs', {username: player.username});
    } else {
      res.render('user.hbs', {username: 'not found'});
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

app.post('/join', (req, res) => {
  Game.findOne({slug: req.body.slug}, (err, game) => {
    if (err) {
      console.log(err);
      res.status(500).send();
    } else if (game) {
      bcrypt.compare((req.body.password || ''), (game.password || ''), (err, passwordMatch) => {
        if (err) {
          console.log(err);
          res.status(500).send();
        } else if (game.password && !passwordMatch) {
          console.log('Wrong password.');
          res.status(204).send({message: 'Wrong password.'});
        } else {
          if (game.players.includes(res.locals.username)) {
            console.log('Duplicate user in game.');
            res.status(204).send({message: 'You are already in this game.'});
          } else {
            req.user.games.push(mongoose.Schema.Types.ObjectId(game._id));
            game.players.push(res.locals.username);
            game.save((err, game) => {
              if (err) {
                console.log(err);
                res.status(500).send();
              } else {
                req.user.save((err, player) => {
                  if (err) {
                    console.log(err);
                    res.status(500).send();
                  } else {
                    console.log('Joined game');
                    res.redirect('/'); // TODO: redirect to game/:slug (req.body.slug)
                  }
                })
              }
            });
          }
        }
      });
    } else {
      console.log(err); // game not found
      res.status(500).send();
    }
  });
});

app.post('/create', (req, res) => {
  Game.findOne({name: req.body.name}, (err, game) => {
    if (err) {
      console.log(err);
      res.status(500).send();
    } else if (game) {
      console.log('Duplicate game name.');
      res.status(204).send({message: 'Name already exists.'});
    } else {
      bcrypt.hash((req.body.password || ''), 10, (err, hash) => {
        if (err) {
          console.log(err);
          res.status(500).send();
        } else {
          const details = req.body;
          if (details.password) {
            details.password = hash;
          }
          new Game(details).save((err, game) => {
            if (err) {
              console.log(err);
              res.status(500).send();
            } else {
              req.user.games.push(mongoose.Schema.Types.ObjectId(game._id));
              game.players.push(res.locals.username);
              game.save((err, game) => {
                if (err) {
                  console.log(err);
                  res.status(500).send();
                } else {
                  req.user.save((err, player) => {
                    if (err) {
                      console.log(err);
                      res.status(500).send();
                    } else {
                      console.log('Created game.');
                      res.redirect('/'); // TODO: redirect to game/:slug
                    }
                  })
                }
              });
            }
          });
        }
      });
    }
  });
});

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

app.listen(PORT);
