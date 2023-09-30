const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  toListen: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
  }],
  liked: [{
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
    },
    note: {
      type: Number,
      min: 0,
      max: 10,
      required: false,
    },
  }],
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
