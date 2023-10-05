const mongoose = require('mongoose');
const Artist = require('../models/artist'); 

async function createArtist(data) {
  try {
    const newArtist = new Artist(data);
    await newArtist.save();
    return newArtist;
  } catch (error) {
    throw error;
  }
}

async function getAllArtists() {
  try {
    const artists = await Artist.find();
    return artists;
  } catch (error) {
    throw error;
  }
}

async function getArtistById(artistId) {
  try {
    const artist = await Artist.findById(artistId);
    return artist;
  } catch (error) {
    throw error;
  }
}

async function updateArtist(artistId, newData) {
  try {
    const updatedArtist = await Artist.findByIdAndUpdate(artistId, newData, { new: true });
    return updatedArtist;
  } catch (error) {
    throw error;
  }
}

async function deleteArtist(artistId) {
  try {
    await Artist.findByIdAndDelete(artistId);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
};
