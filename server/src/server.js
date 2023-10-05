const express = require('express');
const axios = require('axios');
const config = require('../../config/config') 
//npm client library for Discogs.com (Music database API)
const Discogs = require('disconnect').Client;
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = 3001;

//I could use a environment variable to store the password with the npm module dotenv but it's testing so no needs.
const uri = "mongodb+srv://listenerd_test:wKSMDtg283ojJncG@cluster0.zcloy3n.mongodb.net/?retryWrites=true&w=majority";

//The code between line 10 and 31 is provided by the website cloud.mongodb.com to implement MongoDB Atlas and have an online database
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const discogsAPI = new Discogs({
	consumerKey: `${config.discogs.consumerKey}`, 
	consumerSecret: `${config.discogs.consumerSecret}`
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


app.get('/discogs-search', async (req, res) => {
  try {
    const response = await axios.get('https://api.discogs.com/v2/...', {
      headers: {
        Authorization: `Discogs token=${config.get('discogsApiKey')}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la requête Discogs' });
  }
});

app.get('/discogs-main', (req, res) => {
  var db = discogsAPI.database();
  db.search ("", function(err, data){
    res.send(data);
  });
});

app.get('/discogs-search', (req, res) => {
  var db = discogsAPI.database();
  db.search (req.body, function(err, data){
    res.send(data);
  });
});

app.get('/discogs-album', (req, res) => {
  var db = discogsAPI.database();
  db.getRelease (req.body.albumId, function(err, data){
    res.send(data);
  });
});

app.get('/discogs-artist', (req, res) => {
  var db = discogsAPI.database();
  db.getArtist (req.body.artistId, function(err, data){
    res.send(data);
  });
});

app.get('/discogs-artist-albums', (req, res) => {
  var db = discogsAPI.database();
  db.getArtistReleases(req.body.artistId, function(err, data){
    res.send(data);
  });
});

app.listen(port, () => {
  console.log(`Server express is running on the port ${port}`);
});