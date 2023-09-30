const mongoose = require('mongoose');

const photoMongooseSchema = new mongoose.Schema({
    height: Number,
    resource_url: String,
    type: String,
    uri: String,
    uri150: String,
    width: Number,
});

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  albums: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
  }],
  photo: [photoMongooseSchema]
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
