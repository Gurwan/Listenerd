const handler = require('../handlers/ArtistHandler'); 

async function createArtist(req, res) {
  try {
    const data = req.body;
    const newArtist = await handler.createArtist(data);
    res.status(201).json(newArtist);
  } catch (error) {
    res.status(500).json({ error: 'The creation of the artist is impossible' });
  }
}

async function getAllArtists(req, res) {
  try {
    const artists = await handler.getAllArtists();
    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ error: 'The read of all artists is impossible' });
  }
}

async function getArtistById(req, res) {
  try {
    const id = req.params.id;
    const artist = await artistHandler.getArtistById(id);
    if (!artist) {
      res.status(404).json({ error: 'Artist not found' });
    } else {
      res.status(200).json(artist);
    }
  } catch (error) {
    res.status(500).json({ error: 'Impossible to get the artist' });
  }
}

async function updateArtist(req, res) {
  try {
    const id = req.params.id; 
    const data = req.body; 
    const updatedArtist = await handler.updateArtist(id, data);
    if (!updatedArtist) {
      res.status(404).json({ error: 'Artist not found' });
    } else {
      res.status(200).json(updatedArtist);
    }
  } catch (error) {
    res.status(500).json({ error: 'Impossible to update the artist' });
  }
}

async function deleteArtist(req, res) {
  try {
    const id = req.params.id; 
    await handler.deleteArtist(id);
    res.status(204).json("Delete done"); 
  } catch (error) {
    res.status(500).json({ error: 'Impossible to delete the artist' });
  }
}

module.exports = {
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
};
