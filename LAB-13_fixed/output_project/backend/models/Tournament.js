const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  id:        { type: Number, required: true, unique: true },
  name:      { type: String, required: true },
  short:     { type: String },
  type:      { type: String },
  region:    { type: String },
  status:    { type: String, enum: ['live', 'upcoming', 'qualifying', 'completed'], default: 'upcoming' },
  stadium:   { type: String },
  city:      { type: String },
  country:   { type: String },
  teams:     { type: Number },
  matches:   { type: Number },
  prize:     { type: String },
  startDate: { type: String },
  endDate:   { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
