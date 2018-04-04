const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const Game = mongoose.model('Game');
const User = mongoose.model('User');

const app = express();

app.use(
  express.static(path.join(__dirname, 'public')),
  express.urlencoded({ extended: false }),
  session({
      secret: 'secret thing',
      resave: false,
      saveUninitialized: true,
  }));

/*
* all pages
  * scoreboard -> '/scoreboard'
  * login -> '/login', register -> '/register'
  * logout -> '/' and logs out
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
* /scoreboard
  * [username] -> '/user/[username]'
*/

app.listen(3000);
