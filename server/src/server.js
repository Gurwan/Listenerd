const express = require('express');
const request = require('request');
const axios = require('axios');
const config = require('../../config/config') 
const querystring = require('querystring');
const cors = require('cors'); 
//npm client library for Discogs.com (Music database API)
const Discogs = require('disconnect').Client;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

const discogs = new Discogs({consumerKey: `${config.discogs.key}`, consumerSecret: `${config.discogs.secret}`});

//The async function run is provided by the website cloud.mongodb.com to implement MongoDB Atlas and have an online database
async function run() {
  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);


app.get('/discogs-main', (req, res) => {
  var db = discogs.database();
  db.search ("", function(err, data){
    res.send(data);
  });
});

//to separate name of artist and album
const regexArtistAlbum = /(.+?)(?:\s+\(\d+\))? - (.+)/;

app.get('/discogs-search', (req, res) => {
  var db = discogs.database();
  db.search ({artist: req.query.search,type: "release",page:"1",per_page:"50"})
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
          //id album artist image cover and year
          arrayAlbum.push([searchResult.results[i].id, matchArtistAlbum[1].trim(), matchArtistAlbum[2].trim(), cover,searchResult.results[i].year]);
          i = i+1
        }
        res.send(arrayAlbum)
    } else {
      console.log("No album was found.")
    }
    });
});

app.get('/discogs-trends', (req, res) => {
  var db = discogs.database();
  //filter to test 
  db.search ({country: "France", year: "2023", type:"release", style: ["Rap"], per_page: "25"})
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
  var db = discogs.database();
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
  var db = discogs.database();
  db.getArtist (req.query.artistId, function(err, data){
    let nameOfArtist = data.name.replace(/\s*\([^)]*\)\s*/, '');
    let cover = null;
    if(data.images != null){
      cover = data.images[0].uri;
    }
    artistData = [data.id,nameOfArtist,cover,data.profile];
    res.send(artistData);
  });
});

app.get('/discogs-artist-albums', (req, res) => {
  var db = discogs.database();
  db.getArtistReleases(req.body.artistId, function(err, data){
    res.send(data);
  });
});

//code provided by spotify api
app.get('/user-auth-spotify-callback', async function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var client_id = `${config.spotify.clientId}`;
  var client_secret = `${config.spotify.clientSecret}`
  if (state === null) {
    res.redirect('/' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: 'http://localhost:3001/user-auth-spotify-callback',
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, async function(error, response, body) {
      if (response.statusCode === 200) {
        const access_token = body.access_token;
        const refresh_token = body.refresh_token;

        const dataToDB = {
          idAuth: new ObjectId(0),
          access_token: access_token,
          refresh_token: refresh_token,
          date: new Date()
        }

        try {
          await client.connect();
          await client.db('Listenerd').collection('spotifyAuth').insertOne(dataToDB);
          console.log("Access token generated and added to the db")
        } finally {}
      }
      res.redirect('http://localhost:8080/');
    });
  }
});

app.get('/get-spotify-access-token', async function(req, res) {
  try {
    await client.connect();
    const data = await client.db("Listenerd").collection("spotifyAuth").findOne();
    if (data) {
      const currentTime = new Date();
      //1 hour
      if ((currentTime - data.date) > 3600000) {
        const refresh_token = data.refresh_token;
        const client_id = `${config.spotify.clientId}`;
        const client_secret = `${config.spotify.clientSecret}`;
    
        //code providing by spotify API
        var requestData = {
          url: 'https://accounts.spotify.com/api/token',
          headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
          form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
          },
          json: true
        };
    
        request.post(requestData, async function (e, response, body) {
          if (response.statusCode === 200) {
            var access_token = body.access_token;
            
            const newAccessToken = {
              $set: {
                access_token: access_token,
                date: new Date()
              }
            };
    
            let idAuth = data.idAuth
            await client.db("Listenerd").collection("spotifyAuth").updateOne({ idAuth }, newAccessToken);
            res.send(access_token)
          } else {
           // console.log(response)
          }
        });
      } else {
        const accessToken = data.access_token;
        res.send(accessToken)
      }
    } else {
      console.log("access_token not found")
      //code provided by spotify api
      res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: `${config.spotify.clientId}`,
        scope:  'user-read-private user-read-email',
        redirect_uri: 'http://localhost:3001/user-auth-spotify-callback',
        state: "stateNotNull"
      })); 
    }
  } finally {
  }
});

//code 
app.listen(port, () => {
  console.log(`Server side is running on localhost:${port}`);
});