const handler = require('../handlers/AlbumHandler'); 

async function createAlbum(req, res) {
  try {
    const data = req.body; 
    const newAlbum = await handler.createAlbum(data);
    res.status(201).json(newAlbum);
  } catch (error) {
    res.status(500).json({ error: 'Impossible to create the album' });
  }
}

async function getAllAlbums(req, res) {
  try {
    const albums = await handler.getAllAlbums();
    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ error: 'Impossible to get albums' });
  }
}

async function getAlbumById(req, res) {
  try {
    const id = req.params.id; 
    const album = await albumHandler.getAlbumById(id);
    if (!album) {
      res.status(404).json({ error: 'Album not found' });
    } else {
      res.status(200).json(album);
    }
  } catch (error) {
    res.status(500).json({ error: 'Impossible de get the album' });
  }
}

async function getAllAlbumsOfArtist(req, res) {
  try {
    const artistId = req.params.artistId; 
    const albums = await albumHandler.getAllAlbumsOfArtist(artistId);
    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ error: 'Impossible to get albums of this artist' });
  }
}

async function updateAlbum(req, res) {
  try {
    const id = req.params.id; 
    const data = req.body; 
    const updatedAlbum = await albumHandler.updateAlbum(id, data);
    if (!updatedAlbum) {
      res.status(404).json({ error: 'Album not found' });
    } else {
      res.status(200).json(updatedAlbum);
    }
  } catch (error) {
    res.status(500).json({ error: 'Impossible to update album' });
  }
}

async function deleteAlbum(req, res) {
  try {
    const id = req.params.id; 
    await albumHandler.deleteAlbum(id);
    res.status(204).json("Delete is done")
  } catch (error) {
    res.status(500).json({ error: 'Impossible to delete the album' });
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
