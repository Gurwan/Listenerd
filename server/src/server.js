const express = require('express');
const request = require('request');
const axios = require('axios');
const config = require('../../config/config') 
const querystring = require('querystring');
const NodeCache = require('node-cache');
const cors = require('cors'); 
//npm client library for Discogs.com (Music database API)
const Discogs = require('disconnect').Client;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const e = require('express');
const app = express();
const cache = new NodeCache();
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
  } catch (e) {
    //console.log(e)
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

async function getSpotifyAccessToken(){
  return 'BQDZnTF1ZLQb7eqhVCn1PCwDHiD5iYalTyLW1YtpGWXVxXPhxAJGgUHSUorbj6o0-aLra1b2gajkIUK5jaIA5YUutcK1bgNbqrOP0bYlnxz-b-n3EhEXI7MfaDjQAjBH2nKCJ7OTiGJmxuf6fuICiuc8JcNkpvm1adbyTibvnoNYofyvacpmFPEJowHKDyHCdJ4'
  const spotifyInCache = cache.get('spotify_accessToken');
  if(!spotifyInCache){
    console.log("the spotify access token is not available in the cache !")
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
              cache.set('spotify_accessToken', access_token, 3000);
              return access_token
            } else {
            }
          });
        } else {
          const accessToken = data.access_token;
          cache.set('spotify_accessToken', accessToken, 3000);
          return accessToken
        }
      } else {
        console.log("access_token not found")
        return null;
      }
    } finally {
    }
  } else {
    return spotifyInCache
  }
}


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

//albums shown on the home page
app.get('/new-releases', async (req, res) => {
  const accessTokenSpotify = await getSpotifyAccessToken();
  axios.get(`https://api.spotify.com/v1/browse/new-releases?country=FR&limit=50&offset=0`, {
    headers: {
      Authorization: `Bearer ${accessTokenSpotify}`,
    },
  })
  .then((response) => {
    const albums = response.data.albums.items
    let i = 0
    let arrayAlbum = []
    while(i < albums.length){
      //id and name of artist
      const artistData = [albums[i].artists[0].id,albums[i].artists[0].name]
      //id, name, artist, cover and release date
      arrayAlbum.push([albums[i].id, albums[i].name, artistData, albums[i].images[0].url,albums[i].release_date])
      i = i+1
    }
    res.send(arrayAlbum)
  })
  .catch((error) => {
    console.error('Spotify API error', error);
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
    //Line of code found on https://stackoverflow.com/questions/4550237/how-to-crop-a-string-which-is-exceeding-the-element-length
    let description = data.profile.length > 150 ? data.profile.substring(0,150) + "..." : data.profile; 
    artistData = [data.id,nameOfArtist,cover,description];
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
  const accessToken = this.getSpotifyAccessToken();
  if(accessToken == null){
    //code provided by spotify api
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: `${config.spotify.clientId}`,
      scope:  'user-read-private user-read-email',
      redirect_uri: 'http://localhost:3001/user-auth-spotify-callback',
      state: "stateNotNull"
    })); 
  } else {
    res.send(accessToken);
  }
});

//code 
app.listen(port, () => {
  console.log(`Server side is running on localhost:${port}`);
});