const mongoose = require('mongoose');
const Album = require('../models/album'); 

async function createAlbum(data) {
  try {
    const newAlbum = new Album(data);
    await newAlbum.save();
    return newAlbum;
  } catch (error) {
    throw error;
  }
}

async function getAllAlbums() {
  try {
    const albums = await Album.find();
    return albums;
  } catch (error) {
    throw error;
  }
}

async function getAlbumById(albumId) {
  try {
    const album = await Album.findById(albumId);
    return album;
  } catch (error) {
    throw error;
  }
}

async function getAllAlbumsOfArtist(artistId) {
  try {
    const albums = await Album.find({ artists: artistId });
    return albums;
  } catch (error) {
    throw error;
  }
}

async function updateAlbum(albumId, newData) {
  try {
    const updatedAlbum = await Album.findByIdAndUpdate(albumId, newData, { new: true });
    return updatedAlbum;
  } catch (error) {
    throw error;
  }
}

async function deleteAlbum(albumId) {
  try {
    await Album.findByIdAndDelete(albumId);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  getAllAlbumsOfArtist,
  updateAlbum,
  deleteAlbum,
};
