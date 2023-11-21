const express = require('express');
const request = require('request');
const axios = require('axios');
const config = require('../../config/config') 
const querystring = require('querystring');
const cors = require('cors'); 
const jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const port = 3001;
const UserController = require('../controllers/UserController');
const AlbumController = require('../controllers/AlbumController');
const ArtistController = require('../controllers/ArtistController');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;
let userController;
let artistController;
let albumController;

/** Async function allowing connection with the database */
async function run() {
    try {
      let connection = await client.connect();
      db = connection.db('Listenerd');
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your database. You successfully connected to MongoDB!");
      createControllers();
    } catch (e) {
      console.log(e)
    }
  }
run().catch(console.dir);

/**
 * Method used to create the three controllers
 */
function createControllers(){
  userController = new UserController(db);
  albumController = new AlbumController(db);
  artistController = new ArtistController(db);
}

/**
 * Get the Spotify access token store in the database
 */
async function getSpotifyAccessToken(){
  let ret = null;
  let i = 0;
  //if the token is refreshed we redo the operation to find the new one => not ideal way to do that
  while(ret == null || i<2){
    i = i + 1;
    try {
      await client.connect();
      let data = await db.collection("spotifyAuth").findOne();
      //first use of the app : implement an old token but with the good refresh_token !
      if(!data){
        const basicKeyToInsert = {
          "idAuth": "w0oNPVwJMIJgNEjB",
          "access_token": null,
          "refresh_token": "AQD1vU9xGfuJXp5IMcifMJRI2un3qfQ-3PxZ7qIgnexksiWxB8tfxKqp1-AC2jyUP92DFV9aB7vTJtF9i0bjg9vPyqo2fT2Z5Rapg_7mklKF68DyFS0m17TCnmgSobJvuwg",
          "date": new Date()
        }
        await db.collection("spotifyAuth").insertOne(basicKeyToInsert);
      }
      data = await db.collection("spotifyAuth").findOne();
      if (data) {
        const currentTime = new Date();
        if (((currentTime -  data.date) > 3600000) || data.access_token == null) {
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
              await db.collection("spotifyAuth").updateOne({ idAuth }, newAccessToken);
              ret = access_token;
            } 
          });
        } else {
          ret = data.access_token;
        }
      } else {
        console.log("access_token not found")
      }
    } finally {
    }
  }
  return ret;
}

/**
 * Method to initialize the connection with the Spotify API
 * Not should be used doesn't work normally
 * The code is provide by Spotify API documentation
 */
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
          await db.collection('spotifyAuth').insertOne(dataToDB);
          console.log("Access token generated and added to the db")
        } finally {}
      }
      res.redirect('http://localhost:8080/');
    });
  }
});

/**
 * Method used to transform the album format of Spotify API to Listenerd format to print album data
 * @param {*} response album data from Spotify API
 * @returns album format adapted to Listenerd front-end
 */
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

/**
 * Method used to transform the artist format of Spotify API to Listenerd format to print artist data
 * @param {*} response artist data from Spotify API
 * @returns artist format adapted to Listenerd front-end
 */
function formatArtist(response){
  const artists = response.data.artists.items
  let i = 0
  let arrayArtist = []
  while(i < artists.length){
    //id and name of artist
    if(artists[i].images.length != 0){
      const artistData = [artists[i].id,artists[i].name, artists[i].images[0].url]
      arrayArtist.push(artistData)
    }
    i = i+1
  }
  return arrayArtist;
}

/**
 * Method allowing the search feature
 * Need to be improve with the filter feature
 */
app.get('/search', async (req, res) => {
  let accessTokenSpotify = null;
  while(accessTokenSpotify == null){
    accessTokenSpotify = await getSpotifyAccessToken();
  }
  let field = req.query.field;
  if(field == 'album'){
    axios.get(`https://api.spotify.com/v1/search?q=${req.query.search}&type=album&limit=${req.query.limit}`, {
      headers: {
        Authorization: `Bearer ${accessTokenSpotify}`,
      },
    })
    .then((response) => {
      const arrayAlbum = formatAlbum(response);
      res.send({arrayAlbum,field});
    })
    .catch((error) => {
      console.error('Spotify API error');
    });
  } else if(field == 'artist'){
    axios.get(`https://api.spotify.com/v1/search?q=${req.query.search}&type=artist&limit=${req.query.limit}`, {
      headers: {
        Authorization: `Bearer ${accessTokenSpotify}`,
      },
    })
    .then((response) => {
      const arrayArtist = formatArtist(response);
      res.send({arrayArtist,field})
    })
    .catch((error) => {
      console.error('Spotify API error');
    });
  } else if(field == 'user'){
    const resUserController = await userController.getUsers(req.query.search);
    if(resUserController[0]){
      const returnUsers = []
      const arrayUser = resUserController[1];
      for(let i in arrayUser){
        returnUsers.push([arrayUser[i].username,arrayUser[i].profilePicture]);
      }
      res.send({returnUsers,field})
    } else {
      res.status(500).send("Server error")
    }
  }
 
});

/**
 * REST GET method called by the home page of the app
 * Can be adapted to the user country and use getCountryOfUser of UserController
 */
app.get('/new-releases', authUser, async (req, res) => {
  //country by default
  let country = 'IE'
  if(req.user != undefined && req.user != null){
    const resController = await userController.getCountryOfUser(req.user.username);
    if(resController[0]){
      country = resController[1];
    }
  }
  const accessTokenSpotify = await getSpotifyAccessToken();
  axios.get(`https://api.spotify.com/v1/browse/new-releases?country=${country}&limit=50&offset=0`, {
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

/**
 * REST GET method allowing to get album informations from Spotify API
 */
app.get('/album', async (req, res) => {
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
    albumData = [data.id,data.name,artistData,data.images[0].url,data.release_date,data.artist,data.label,data.genres[0], data.tracks.items, data.popularity];
    res.send(albumData)
  })
  .catch((error) => {
    console.error('Spotify API error', error);
  });
});

/**
 * REST GET method allowing to get all artist information from Spotify API and Listenerd database
 */
app.get('/artist', async (req, res) => {
  const accessTokenSpotify = await getSpotifyAccessToken();
  let artistData = []
  //get artist from the Spotify API
  axios.get(`https://api.spotify.com/v1/artists/${req.query.artistId}`, {
    headers: {
      Authorization: `Bearer ${accessTokenSpotify}`,
    },
  })
  .then(async (response) => {
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
    
    //spotify followers
    let followers;
    if (data.followers.total >= 1000000) {
      followers = (data.followers.total/ 1000000).toFixed(1) + 'M';
    } else if (data.followers.total >= 1000) {
      followers = (data.followers.total/ 1000).toFixed(0) + 'K';
    } else {
      followers = data.followers.total.toString();
    }

    const resControllerArtist = await artistController.getFollowersOnListenerd(data.id);
    if(resControllerArtist[0]){
      followersOnListenerd = resControllerArtist[1];
    } else {
      followersOnListenerd = 0;
    }
    artistData.push([data.id,data.name,data.images[0].url,followers,data.popularity,genres,followersOnListenerd]);

    //get all albums of the artist thanks to the Spotify API
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

      //get a random top track of this artist thanks to the Spotify API
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

/**
 * Register POST REST method
 * Use register method from UserController
 */
app.post('/user', async (req,res) => {
  const {username, password} = req.body;
  const resController = await userController.register(username,password);
  if(resController[0]){
    jwt.sign({user:{id: resController[1]}},'listenerd_secret_key',
    {expiresIn: 7200}, (err, token) => {
     if(err) throw err;
     res.status(201).json({ token })
    })
  } else {
    if(resController[1] == 400){
      res.status(400).json({msg: 'Username already taken'});
    } else {
      res.status(500).send("Server error")
    }
  }
});

/**
 * Login POST REST method
 * Use login method from UserController
 */
app.post('/login', async (req,res) => {
  const {username, password} = req.body;
  const resController = await userController.login(username,password);
  if(resController[0]){
    jwt.sign({username: resController[1]},'listenerd_secret_key',
    {expiresIn: 7200}, (err, token) => {
     if(err) throw err;
     res.json({token});
    })
  } else {
    if(resController[1] == 400){
      res.status(400).json({msg: 'Username does not exist'});
    } else if (resController[1] == 401){
      res.status(401).json({msg: 'Wrong password'});
    } else {
      res.status(500).send("Server error")
    }
  }
});

/**
 * Logout POST REST method
 * Used just to confirm the logout of the user
 */
app.post('/logout', async (req, res) => {
  res.json({ message: 'Success of logout' });
});

/**
 * Critical function allowing to identify the user logged
 * This method is used as a middleware for several REST methods
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function authUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  jwt.verify(token, 'listenerd_secret_key', (err, user) => {
    //if token is null the request is for the main tab (public access)
    if(((req.route.path) == "/new-releases") || token != null && user != undefined){
      req.user = user;
      next(); 
    } else {
      //if token is not null but the user is that means that the token has expired
      console.log("Token expired, user will be disconnect")
      res.status(401)
      res.send("Token expired")
    }
  });
}

/**
 * GET REST method allowing to get user information to display the user profile page
 */
app.get('/user', authUser, async (req, res) => {
  const username = req.user.username;
  const resControllerUser = await userController.getUserData(username,albumController,artistController);
  const resControllerParams = await userController.getUserParams(username);
  if(resControllerUser[0]){
    const user = resControllerUser[1];
    const preview = resControllerUser[2];
    if(resControllerParams[0]){
      const params = resControllerParams[1];
      res.status(200).send({user,preview,params});
    } else {
      res.status(200).send({user,preview});
    }
  } else {
    res.status(resControllerUser[1]).send("Server error")
  }
});

/**
 * GET REST method allowing to get username of the user connected
 */
app.get('/username', authUser, async (req, res) => {
  const username = req.user.username;
  res.status(200).send({message : username});
});

/**
 * GET REST method allowing to get user information to display the user profile page for other users
 */
app.get('/user-public', async (req, res) => {
  const username = req.query.username;
  const resControllerUser = await userController.getUserData(username,albumController,artistController);
  if(resControllerUser[0]){
    const user = resControllerUser[1];
    const preview = resControllerUser[2];
    res.status(200).send({user,preview});
  } else {
    res.status(resControllerUser[1]).send("Server error")
  }
});

/**
 * DELETE REST method allowing to delete a user account
 */
app.delete('/user', authUser, async (req, res) => {
  const username = req.user.username;
  const resControllerUser = await userController.deleteUser(username);
  const resControllerParams = await userController.deleteUserParams(username);
  if(resControllerUser[0]){
    if(resControllerParams[0]){
      res.status(200).send({message: 'User account fully deleted'});
    } else {
      res.status(resControllerParams[1]).send("Server error")
    } 
  } else {
    res.status(resControllerUser[1]).send("Server error")
  }
});

/**
 * Get content of a list among liked, to listen and followed artists lists
 */
app.get('/list', authUser, async (req, res) => {
  const username = req.user.username;
  const list = req.query.list;
  const accessTokenSpotify = await getSpotifyAccessToken();
  const resUserController = await userController.getUserList(username,list,artistController,albumController,accessTokenSpotify);
  if(resUserController[0]){
    res.status(200).send(resUserController[1]);
  } else {
    res.status(resUserController[1]).send("Server error")
  }
});

/**
 * PUT REST method allowing to change the profile picture of the user
 */
app.put('/user-picture', authUser, async (req, res) => {
  const username = req.user.username;
  const fileBase64 = req.body.fileBase64;
  const type = req.body.type;
  const resUserController = await userController.updatePicture(username,fileBase64,type);
  if(resUserController[0]){
    res.status(200).json({ msg: 'Profile picture updated' });
  } else {
    res.status(resUserController[1]).json({ msg: 'Server error' })
  }
});

/**
 * PUT REST method to change the country of the user
 */
app.put('/country', authUser, async (req, res) => {
  const username = req.user.username;
  const country = req.body.dataToSend;
  const resUserController = await userController.updateCountry(username,country);
  if(resUserController[0]){
    res.status(200).json({ msg: 'Country updated' });
  } else {
    res.status(resUserController[1]).json({ msg: 'Server error' });
  }
});

/**
 * PUT REST method to change the scale of rating of albums for a user
 */
app.put('/scale', authUser, async (req, res) => {
  const username = req.user.username;
  const scale = req.body.dataToSend;
  const update = {$set: {'scale': scale}};
  const resUserController = await userController.updateParams(username,update);
  if(resUserController[0]){
    res.status(200).json({ message: 1})
  } else {
    res.status(resUserController[1]).json({ msg: 'Server error' });
  }
});

/**
 * PUT REST method to change ranges and colors for rating albums
 */
app.put('/gap', authUser, async (req, res) => {
  const username = req.user.username;
  const gap = req.body.dataToSend;
  const update = {$set: {'gap': gap}};
  const resUserController = await userController.updateParams(username,update);
  if(resUserController[0]){
    res.status(200).json({ message: 1})
  } else {
    res.status(resUserController[1]).json({ msg: 'Server error' });
  }
});

/**
 * PUT REST method change the rate of an album
 */
app.put('/rate', authUser, async (req, res) => {
  const username = req.user.username;
  const albumId = req.body.dataToSend[0];
  const rate = req.body.dataToSend[1];
  const resUserController = await userController.updateRate(username,albumId,rate);
  if(resUserController[0]){
    res.status(200).json({ message: 1})
  } else {
    res.status(resUserController[1]).json({ msg: 'Server error' });
  }
});

/**
 * POST REST method allowing to add an album to a list
 */
app.post('/album', authUser, async (req, res) => {
  const username = req.user.username;
  const list = req.body.list;
  const dataAlbum = req.body.albumDataToInsertInDB;
  const resUserController = await userController.addAlbumToList(username,list,dataAlbum,albumController,artistController);
  if(resUserController[0]){
    res.status(200).json({ message: resUserController[1]})
  } else {
    res.status(resUserController[1]).json({msg: 'Server error'})
  }
});

/**
 * POST REST method allowing to add a friendship
 */
app.post('/friend', authUser, async (req, res) => {
  const username = req.user.username;
  const friendWith = req.body.withUserId;
  const resUserController = await userController.manageFriendship(username,friendWith);
  if(resUserController[0]){
    res.status(200).json({ message: resUserController[1]})
  } else {
    res.status(resUserController[1]).json({msg: 'Server error'})
  }
});

/**
 * Check friendship between the user and one another
 */
app.get('/friend', authUser, async (req, res) => {
  const username = req.user.username;
  const withUser = req.query.withUser;
  const resUserController = await userController.isFriend(username,withUser);
  if(resUserController[0]){
    res.status(200).send({message : resUserController[1]});
  } else {
    res.status(resUserController[1]).send("Server error")
  }
});

/**
 * Get all friends of a user
 */
app.post('/friends', authUser, async (req, res) => {
  const username = req.user.username;
  const allData = req.body.allData;
  const resUserController = await userController.getFriends(username,allData);
  if(resUserController[0]){
    res.status(200).send({ message: resUserController[1]});
  } else {
    res.status(resUserController[1]).send("Server error")
  }
});

/**
 * REST POST method allowing to get albums with their status in each list of the user
 */
app.post('/album-user', authUser, async (req, res) => {
  const allData = req.body.allData;
  const username = req.user.username;
  const resUserController = await userController.checkList(username,allData);
  if(resUserController[0]){
    res.status(200).json({ message: resUserController[1]})
  } else {
    res.status(resUserController[1]).json({msg: 'Server error'})
  }
});

/**
 * REST POST method allowing to get artists followed by the user connected
 */
app.post('/artist-user', authUser, async (req, res) => {
  const allData = req.body.allData;
  const username = req.user.username;
  const resUserController = await userController.checkFollow(username,allData);
  if(resUserController[0]){
    res.status(200).json({ message: resUserController[1]})
  } else {
    res.status(resUserController[1]).json({msg: 'Server error'})
  }
});

/**
 * POST REST method allowing to a user to follow/unfollow an artist
 */
app.post('/artist', authUser, async (req, res) => {
  const username = req.user.username;
  const dataArtist = req.body.artistToFollow;
  const resUserController = await userController.followArtist(username,dataArtist,artistController);
  if(resUserController[0]){
    res.status(200).json({ message: resUserController[1]})
  } else {
    res.status(resUserController[1]).json({ msg: 'Server error' })
  }
});

/**
 * POST REST method checking if a user follow an artist or not
 */
app.post('/check-follow', authUser, async (req, res) => {
  const username = req.user.username;
  const artistId = req.body.artistId[0];
  const resUserController = await userController.isFollowed(username,artistId);
  if(resUserController[0]){
    res.status(200).json({ message: resUserController[1]})
  } else {
    res.status(resUserController[1]).json({msg: 'Server error'})
  }
});

/**
 * POST REST method checking if an album is in list
 */
app.post('/check-list', authUser, async (req, res) => {
  const username = req.user.username;
  const albumId = req.body.albumId[0];
  const resUserController = await userController.isInList(username,albumId);
  if(resUserController[0]){
    //ret et userParams
    res.status(200).json({ message: resUserController[1][0], params: resUserController[1][1]})
  } else {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * DELETE REST method allowing to clear the followed artists list
 */
app.delete('/followed-list', authUser, async (req, res) => {
  const username = req.user.username;
  const resUserController = await userController.clearList(username,2);
  if(resUserController[0]){
    res.status(200).json({ message: 'List cleared'})
  } else {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * DELETE REST method allowing to clear the to listen list
 */
app.delete('/to-listen-list', authUser, async (req, res) => {
  const username = req.user.username;
  const resUserController = await userController.clearList(username,0);
  if(resUserController[0]){
    res.status(200).json({ message: 'List cleared'})
  } else {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * DELETE REST method allowing to clear the liked albums list
 */
app.delete('/liked-list', authUser, async (req, res) => {
  const username = req.user.username;
  const resUserController = await userController.clearList(username,1);
  if(resUserController[0]){
    res.status(200).json({ message: 'List cleared'})
  } else {
    res.status(500).json({ msg: 'Server error' });
  }
});

/** This method starts the app */
app.listen(port, () => {
  console.log(`Server side is running on localhost:${port}`);
});