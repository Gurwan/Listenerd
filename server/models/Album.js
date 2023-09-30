const mongoose = require('mongoose');

const coverMongooseSchema = new mongoose.Schema({
  height: Number,
  resource_url: String,
  type: String,
  uri: String,
  uri150: String,
  width: Number,
});

const albumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: Number,
    required: true,
  },
  release_date: {
    type: Date,
    required: true,
  },
  genre: {
    type: String,
    required: true,
    trim: true,
  },
  popularity: {
    type: Number,
  },
  artists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
  }],
  cover: [coverMongooseSchema]
});

albumSchema.methods.getYear = function () {
  return this.release_date.getFullYear();
};

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
