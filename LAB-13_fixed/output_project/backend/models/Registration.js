const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    playerName:      { type: String, required: [true, 'Player name is required'], trim: true },
    email:           { type: String, required: [true, 'Email is required'], trim: true, lowercase: true,
                       match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] },
    phone:           { type: String, required: [true, 'Phone number is required'], trim: true },
    gameTitle:       { type: String, required: [true, 'Game title is required'], trim: true },
    tournamentName:  { type: String, required: [true, 'Tournament name is required'], trim: true },
    teamName:        { type: String, trim: true, default: '' },
    registrationFee: { type: Number, required: [true, 'Registration fee is required'], min: [0, 'Fee cannot be negative'] },
    paymentMethod:   { type: String, enum: ['MetaMask', 'Cash', 'Bank Transfer', 'Card'], default: 'Cash' },
    paymentStatus:   { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    walletAddress:   { type: String, default: '' },
    transactionHash: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
