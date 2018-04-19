const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;

const mongoose = require('mongoose');
const Player = mongoose.model('Player');

module.exports = (passport) => {
  passport.serializeUser((player, done) => {
    done(null, player._id);
  });

  passport.deserializeUser((id, done) => {
    Player.findOne({_id: new mongoose.Types.ObjectId(id)}, (err, player) => {
      done(err, player);
    });
  });

  passport.use('local-login', new LocalStrategy(
    (username, password, done) => {
      Player.findOne({ username: username }, (err, player) => {
        if (err) {
          return done(err);
        } else if (!player) {
          return done(null, false, { message: 'Incorrect username.' });
        } else {
          bcrypt.compare(password, player.password, (err, passwordMatch) => {
            if (err) {
              done(err);
            } else if (passwordMatch) {
              return done(null, player);
            } else {
              return done(null, false, { message: 'Incorrect password.' });
            }
          });
        }
      });
    }
  ));

  passport.use('local-signup', new LocalStrategy(
    (username, password, done) => {
    Player.findOne({username: username}, (err, player) => {
      if (err) {
        done(err);
      } else if (player) {
        done(null, false, { message: 'Username taken.' });
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          err ? done(err) : new Player({ username: username, password: hash }).save(
            (err, player) => {
              err ? done(err) : done(null, player);
            });
        });
      }
    });
  }));
};
