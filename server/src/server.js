const express = require('express');
const axios = require('axios');
const config = require('../../config/config') 
const cors = require('cors'); 
//npm client library for Discogs.com (Music database API)
const Discogs = require('disconnect').Client;
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = 3001;

app.use(cors());

//I could use a environment variable to store the password with the npm module dotenv but it's testing so no needs.
const uri = "mongodb+srv://listenerd_test:wKSMDtg283ojJncG@cluster0.zcloy3n.mongodb.net/?retryWrites=true&w=majority";

//The code between line 10 and 42 is provided by the website cloud.mongodb.com to implement MongoDB Atlas and have an online database
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
    // Connect the client to the server
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


app.get('/discogs-main', (req, res) => {
  var db = discogsAPI.database();
  db.search ("", function(err, data){
    res.send(data);
  });
});

//to separate name of artist and album
const regexArtistAlbum = /(.+?)(?:\s+\(\d+\))? - (.+)/;

app.get('/discogs-search', (req, res) => {
  var db = discogsAPI.database();
  db.search ({artist: req.query.search, per_page: "30", page: "1", type: "release"})
  .then(function (searchResult) {
    if (searchResult.results.length > 0) {
        i = 0
        arrayAlbum = []
        while(i<searchResult.results.length){
          let matchArtistAlbum = searchResult.results[i].title.match(regexArtistAlbum);
          let cover = "https://cdn-icons-png.flaticon.com/512/16/16096.png"
          if(searchResult.results[i].cover_image != undefined && searchResult.results[i].cover_image != null && searchResult.results[i].cover_image != "https://st.discogs.com/455614591780dfa702b27aca035dd230e612f723/images/spacer.gif"){
            cover = searchResult.results[i].cover_image
          }
          arrayAlbum.push([searchResult.results[i].id, matchArtistAlbum[1].trim(), matchArtistAlbum[2].trim(), cover,
          searchResult.results[i].year]);
          i = i+1
        }
        res.send(arrayAlbum)
    } else {
      console.log("No album was found.")
    }
    });
});

app.get('/discogs-trends', (req, res) => {
  var db = discogsAPI.database();
  //filter to test 
  db.search ({country: "France", year: "2023", type:"release", style: ["Rap"], per_page: "300"})
  .then(function (searchResult) {

    if (searchResult.results.length > 0) {
        i = 0
        arrayAlbum = []
        while(i<searchResult.results.length){
          let matchArtistAlbum = searchResult.results[i].title.match(regexArtistAlbum);
          let cover = "https://cdn-icons-png.flaticon.com/512/16/16096.png"
          if(searchResult.results[i].cover_image != undefined && searchResult.results[i].cover_image != null && searchResult.results[i].cover_image != "https://st.discogs.com/455614591780dfa702b27aca035dd230e612f723/images/spacer.gif"){
            cover = searchResult.results[i].cover_image
          }
          arrayAlbum.push([searchResult.results[i].id, matchArtistAlbum[1].trim(), matchArtistAlbum[2].trim(), cover,
          searchResult.results[i].year]);
          i = i+1
        }
        res.send(arrayAlbum)
    } else {
      console.log("No album was found.")

    }
  });
});

app.get('/discogs-album', (req, res) => {
  var db = discogsAPI.database();
  db.getRelease (req.query.albumId, function(err, data){
    let cover = "https://cdn-icons-png.flaticon.com/512/16/16096.png"
    if(data.images != undefined && data.images != null){
      cover = data.images[0].uri
    }
    let nameOfArtist = data.artists[0].name.replace(/\s*\([^)]*\)\s*/, '');
    //id, title, name of artist, image cover, year, id of artist, name of label (add condition), main genre, tracklist
    albumData = [data.id,data.title,nameOfArtist,cover,data.year,data.artists[0].id,data.labels[0].name,data.genres[0], data.tracklist];
    res.send(albumData);
  });
});

app.get('/discogs-artist', (req, res) => {
  var db = discogsAPI.database();
  db.getArtist (req.query.artistId, function(err, data){
    let nameOfArtist = data.name.replace(/\s*\([^)]*\)\s*/, '');
    artistData = [data.id,nameOfArtist,data.images[0].uri,data.profile];
    res.send(artistData);
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