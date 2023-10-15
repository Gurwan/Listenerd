const express = require('express');
const request = require('request');
const axios = require('axios');
const config = require('../../config/config') 
const querystring = require('querystring');
const cors = require('cors'); 
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const e = require('express');
const bcrypt = require('bcrypt');
const app = express();
const port = 3001;
const User = require('../models/User')

app.use(cors());

app.use(express.json());

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
    //await client.close();
  }
}
run().catch(console.dir);

async function getSpotifyAccessToken(){
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
            return access_token
          } else {
          }
        });
      } else {
        const accessToken = data.access_token;
        return accessToken
      }
    } else {
      console.log("access_token not found")
      return null;
    }
  } finally {
  }
}

function formatAlbum(response){
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
  return arrayAlbum
}

//to separate name of artist and album
const regexArtistAlbum = /(.+?)(?:\s+\(\d+\))? - (.+)/;

app.get('/search', async (req, res) => {
  const accessTokenSpotify = await getSpotifyAccessToken();
  axios.get(`https://api.spotify.com/v1/search?q=${req.query.search}&type=album&limit=50`, {
    headers: {
      Authorization: `Bearer ${accessTokenSpotify}`,
    },
  })
  .then((response) => {
    const arrayAlbum = formatAlbum(response);
    res.send(arrayAlbum)
  })
  .catch((error) => {
    console.error('Spotify API error', error);
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
    const arrayAlbum = formatAlbum(response)
    res.send(arrayAlbum)
  })
  .catch((error) => {
    console.error('Spotify API error', error);
  });
});


app.get('/get-album', async (req, res) => {
  const accessTokenSpotify = await getSpotifyAccessToken();
  axios.get(`https://api.spotify.com/v1/albums/${req.query.albumId}`, {
    headers: {
      Authorization: `Bearer ${accessTokenSpotify}`,
    },
  })
  .then((response) => {
    const data = response.data
    artistData = [data.artists[0].id,data.artists[0].name]
    //id, title, id and name of artist, image cover, year, name of label, main genre, tracklist
    albumData = [data.id,data.name,artistData,data.images[0].url,data.release_date,data.artist,data.label,data.genres[0], data.tracks.items];
    res.send(albumData)
  })
  .catch((error) => {
    console.error('Spotify API error', error);
  });
});

app.get('/get-artist', async (req, res) => {
  const accessTokenSpotify = await getSpotifyAccessToken();
  let artistData = []
  //get artist
  axios.get(`https://api.spotify.com/v1/artists/${req.query.artistId}`, {
    headers: {
      Authorization: `Bearer ${accessTokenSpotify}`,
    },
  })
  .then((response) => {
    const data = response.data;
    //id, name, profile picture, followers number, popularity and genres
    let i = 0;
    let genres = "";
    while(i < data.genres.length){
      if(i == data.genres.length - 1){
        genres += data.genres[i]
      } else {
        genres += data.genres[i] + ", "
      }
      i = i + 1
    }
    let followers;
    if (data.followers.total >= 1000000) {
      followers = (data.followers.total/ 1000000).toFixed(1) + 'M';
    } else if (data.followers.total >= 1000) {
      followers = (data.followers.total/ 1000).toFixed(0) + 'K';
    } else {
      followers = data.followers.total.toString();
    }
    artistData.push([data.id,data.name,data.images[0].url,followers,data.popularity,genres]);

    //get all albums
    axios.get(`https://api.spotify.com/v1/artists/${req.query.artistId}/albums`, {
      headers: {
       Authorization: `Bearer ${accessTokenSpotify}`,
     },
    })
    .then((response) => {
      let albumsData = []
      const albums = response.data.items;
      let i = 0
      while(i < albums.length){
        if(albums[i].album_type != "single"){
          albumsData.push([albums[i].id,albums[i].name,albums[i].release_date,albums[i].images[0].url])
        }
        i = i+1
      }
      artistData.push(albumsData)

      //get a top track
      axios.get(`https://api.spotify.com/v1/artists/${req.query.artistId}/top-tracks?market=FR`, {
        headers: {
          Authorization: `Bearer ${accessTokenSpotify}`,
        },
      })
      .then((response) => {
        const topTracks = response.data.tracks;
        const randomTrack = topTracks[Math.floor(Math.random() * topTracks.length)];
        artistData.push(randomTrack.id)

        res.send(artistData)
      })
      .catch((error) => {
        console.error('Spotify API error', error);
      });
    })
    .catch((error) => {
      console.error('Spotify API error', error);
    });
  })
  .catch((error) => {
    console.error('Spotify API error', error);
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

app.post('/register', async (req,res) => {
  const {username, password} = req.body;

  try {
    const users = client.db('Listenerd').collection('users'); 
    let user = await users.findOne({username});
    if(user == null){
      const salt = await bcrypt.genSalt(10);
      let cryptedPassword = await bcrypt.hash(password, salt);

      user = new User(username,cryptedPassword)
      await users.insertOne(user);

      jwt.sign({user:{id: user.id}},'listenerd_secret_key',
       {expiresIn: 7200}, (err, token) => {
        if(err) throw err;
        res.json({token});
       })
    } else {
      return res.status(400).json({msg: 'Username already taken'});
    }
  } catch (err){
    console.log(err)
    res.status(500).send("Server error")
  }
});

app.post('/login', async (req,res) => {
  const {username, password} = req.body;
  try {
    const users = client.db('Listenerd').collection('users'); 
    const user = await users.findOne({ username });    
    if(user){
      const passwordOk = await bcrypt.compare(password, user.password);
      if(passwordOk){
        jwt.sign({user:{id: user.id}},'listenerd_secret_key',
        {expiresIn: 7200}, (err, token) => {
         if(err) throw err;
         res.json({token});
        })
      } else {
        return res.status(400).json({msg: 'Wrong password'});
      }
    } else {
      return res.status(400).json({msg: 'Username does not exist'});
    }
  } catch (err){
    res.status(500).send("Server error")
  }
});

app.post('/logout', async (req, res) => {
  // Vous pouvez implémenter la déconnexion ici

  // Par exemple, supprimez le jeton d'authentification stocké côté client (s'il y en a un)
  // Pour supprimer le jeton stocké dans localStorage :
  // localStorage.removeItem('jwt_token');

  // Si vous utilisez des sessions, vous pouvez également détruire la session ici

  res.json({ message: 'Déconnexion réussie' });
});

//code 
app.listen(port, () => {
  console.log(`Server side is running on localhost:${port}`);
});