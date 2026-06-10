const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  id:          { type: Number, required: true, unique: true },
  name:        { type: String, required: true },
  jersey:      { type: Number },
  position:    { type: String },
  club:        { type: String },
  league:      { type: String },
  rating:      { type: Number },
  nationality: { type: String },
  stats: {
    goals:      Number,
    assists:    Number,
    matches:    Number,
    pace:       Number,
    shooting:   Number,
    passing:    Number,
    dribbling:  Number,
    defending:  Number,
    physical:   Number,
  },
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
