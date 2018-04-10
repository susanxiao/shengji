const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const config = require('../config.json').mongo;

const MODE = {
  shengji: 'shengji',
  zhaopengyou: 'zhaopengyou'
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
  usersPlayedWith: [{
    user: {type: String, required: true},
    times: {type:Number, required: true, default: 0}
  }]
});

mongoose.model('Player', Player, 'players');

const Game = new mongoose.Schema({
  name: {type: String, required: true},
  password: {type: String},
  numDecks: {type: Number, required: true, default: 2},
  mode: {type: String, required: true, enum: Object.getOwnPropertyNames(MODE), default:'shengji'},
  players: [String],
  maxPlayers: {type: Number, required: true, default: 9},
  host: {type: mongoose.Schema.Types.ObjectId, ref: 'Player'},
  started: {type: Boolean, default: false}
});

Game.plugin(URLSlugs('name'));
mongoose.model('Game', Game, 'games');

mongoose.connect(`mongodb://${config.user}:${config.password}@${config.url}`);

module.exports = {
    mongoose: mongoose
};
