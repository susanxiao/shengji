/*
const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

const MODE = {
  SHENGJI: 'Shengji',
  ZHAOPENGYOU: 'Zhaopengyou'
};

const Player = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true, unique: true},
  description: {type: String, default: ''},
  roundWins: {type: Number, default: 0},
  gameWins: {type: Number, default: 0},
  games: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }],
  usersPlayedWith: [
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    times: Number
  ]
});

mongoose.model('Player', Player);

const Game = new mongoose.Schema({
  name: {type: String, required: true},
  password: {type: String, required: true, unique: true},
  numDecks: {type: Number, required: true},
  mode: {type: String, required: true, enum: Object.getOwnPropertyNames(MODE)},
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  host: {type: mongoose.Schema.Types.ObjectId, ref: 'Player'}
});

Game.plugin(URLSlugs('name'));
mongoose.model('Game', Game);

mongoose.connect('mongodb://localhost/final-proj');

module.exports = {
    mongoose: mongoose
};
*/
