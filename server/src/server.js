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
const Album = require('../models/Album')
const Artist = require('../models/Artist');
const { unsubscribe } = require('diagnostics_channel');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (e) {
    console.log(e)
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
  let accessTokenSpotify = null;
  while(accessTokenSpotify == null){
    accessTokenSpotify = await getSpotifyAccessToken();
  }
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
app.get('/new-releases', authUser, async (req, res) => {
  let country = 'IE'
  if(req.user != undefined && req.user != null){
    const username = req.user.username;
    const users = client.db('Listenerd').collection('users'); 
    const user = await users.findOne({ username: username });
    country = user.country;
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
    let followers;
    if (data.followers.total >= 1000000) {
      followers = (data.followers.total/ 1000000).toFixed(1) + 'M';
    } else if (data.followers.total >= 1000) {
      followers = (data.followers.total/ 1000).toFixed(0) + 'K';
    } else {
      followers = data.followers.total.toString();
    }
    const artists = client.db('Listenerd').collection('artists'); 
    let followersOnListenerd = await artists.findOne({ idArtist: data.id });
    if(followersOnListenerd != null || followersOnListenerd != undefined){
      followersOnListenerd = followersOnListenerd.followersListenerd;
    }
    if(followersOnListenerd == null || followersOnListenerd == undefined){
      followersOnListenerd = 0;
    }
    artistData.push([data.id,data.name,data.images[0].url,followers,data.popularity,genres,followersOnListenerd]);

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
        jwt.sign({username: user.username},'listenerd_secret_key',
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
  res.json({ message: 'Success of logout' });
});

function authUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  jwt.verify(token, 'listenerd_secret_key', (err, user) => {
    req.user = user;
    next(); 
  });
}

app.get('/user-profile', authUser, async (req, res) => {
  const username = req.user.username;
  const users = client.db('Listenerd').collection('users'); 
  const user = await users.findOne({ username: username });
  const preview = [[],[], []];
  if(user.toListen != [] || user.liked != []){
    const albums = client.db('Listenerd').collection('albums'); 
    if(user.toListen.length >= 3){
      for(let i=0;i<3;i++){
        let album = await albums.findOne({ idAlbum: user.toListen[i] });
        preview[0].push(album.cover);
      }
    }
    if(user.liked.length >= 3){
      for(let i=0;i<3;i++){
        let album = await albums.findOne({ idAlbum: user.liked[i].id });
        preview[1].push(album.cover);
      }
    }
    if(user.artistFollowed != [] && user.artistFollowed.length >= 3){
      const artists = client.db('Listenerd').collection('artists'); 
      for(let i=0;i<3;i++){
        let artist = await artists.findOne({ idArtist: user.artistFollowed[i] });
        preview[2].push(artist.picture);
      }
    }
  }
  res.send({user,preview})
});

app.get('/user-list', authUser, async (req, res) => {
  const username = req.user.username;
  const users = client.db('Listenerd').collection('users'); 
  const user = await users.findOne({ username: username });
  const list = req.query.list;
  const albums = client.db('Listenerd').collection('albums'); 
  const artists = client.db('Listenerd').collection('artists'); 
  let ret = []
  if(list == 0){
    for(let i=0;i<user.toListen.length;i++){
      let album = await albums.findOne({ idAlbum: user.toListen[i] });
      let artist = await artists.findOne({ idArtist: album.artistId });
      ret.push([album.idAlbum, album.title, [album.artistId, artist.name], album.cover, album.releaseDate]);
    }
  } else if(list == 1) {
    user.liked.sort((a, b) => b.rate - a.rate);
    for(let i=0;i<user.liked.length;i++){
      let album = await albums.findOne({ idAlbum: user.liked[i].id });
      let artist = await artists.findOne({ idArtist: album.artistId });
      ret.push([album.idAlbum, album.title, [album.artistId, artist.name], album.cover, album.releaseDate, user.liked[i].rate]);
    }
  } else {
    //artist followed
    let accessTokenSpotify = await getSpotifyAccessToken();
    let albumArtistData = []
    for(let i=0;i<user.artistFollowed.length;i++){
      let artist = await artists.findOne({ idArtist: user.artistFollowed[i] });
      let artistId = artist.idArtist;
      let sizeAlbumsList = albumArtistData.length;
      await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
          headers: {
          Authorization: `Bearer ${accessTokenSpotify}`,
        },
      }).then((response) => {
          const albums = response.data.items;
          let j = 0;
          while(j < albums.length){
            let releaseDateFormat = new Date(albums[j].release_date);
            let todayDate = new Date();
            //1000 ms in a s, 60s in a m, 60m in an hour and 24 hour in a day 
            var differentInDays = Math.floor((todayDate - releaseDateFormat) / (1000 * 60 * 60 * 24));;
            if(differentInDays <= 365){
              albumArtistData.push([albums[j].id,albums[j].name,albums[j].album_type,albums[j].release_date,albums[j].images[0].url,[artist.idArtist, artist.name, artist.picture]])
            }
            j = j+1;
          }
      });
      if(sizeAlbumsList == albumArtistData.length){
        albumArtistData.push([null,null,null,null,null,[artist.idArtist, artist.name, artist.picture]])
      }
    }
    albumArtistData.sort((el1, el2) => {
      const el1d = new Date(el1[3]);
      const el2d = new Date(el2[3]);
      return el2d - el1d;
    });
    ret.push(albumArtistData);
  }
  res.send(ret)
});

app.post('/user-save-profile-picture', authUser, async (req, res) => {
  const username = req.user.username;
  try {
    const fileBase64 = req.body.fileBase64;
    const type = req.body.type;
    if (!fileBase64 || !type) {
      return res.status(400).json({ message: 'No file sent or wrong format' });
    }
    const users = client.db('Listenerd').collection('users'); 

    const buffer = Buffer.from(fileBase64, 'base64');
    const newImage = {
      data: buffer,
      contentType: type,
    };

    const filter = { username: username };
    const update = { $set: { profilePicture: newImage } };
  
    const result = await users.updateOne(filter, update);
  
    if (result.modifiedCount === 1) {
      return res.status(200).json({ msg: 'Profile picture updated' });
    } else {
      return res.status(500).json({ msg: 'Server error on insertion' });
    }
  } catch (error) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * In fact it is add or remove album to list (to listen or liked list)
 */
app.post('/add-album-to-list', authUser, async (req, res) => {
  const username = req.user.username;
  const list = req.body.list;
  const dataAlbum = req.body.albumDataToInsertInDB;
  const albumId = dataAlbum[0];
  try {
    const users = client.db('Listenerd').collection('users'); 
    const albums = client.db('Listenerd').collection('albums'); 
    let user = await users.findOne({username});
    if(user != null){
      const album = await albums.findOne({idAlbum: albumId});
      if(album == null){
        const artists = client.db('Listenerd').collection('artists'); 
        const artistId = dataAlbum[2][0];
        const artist = await artists.findOne({idArtist: artistId});
        if(artist == null){
          const artistObject = new Artist(artistId,dataAlbum[2][1])
          await artists.insertOne(artistObject);
        }
        const albumObject = new Album(albumId,dataAlbum[1],artistId,dataAlbum[4],dataAlbum[3]);
        await albums.insertOne(albumObject);
      }
      if(list == 0){
        if(user.toListen.includes(albumId)){
          //delete the album of the list
          await users.updateOne({username:username},{$pull: {toListen: albumId}});
          return res.status(200).json({ msg: -10 });
        } else {
          await users.updateOne({username:username},{$push: {toListen: albumId}});
          return res.status(200).json({ msg: 10 });
        }
      } else {
        if(user.liked.some(album => album.id === albumId)){
          //delete the album of the liked list
          await users.updateOne({username:username},{$pull: {liked: {id: albumId}}});
          return res.status(200).json({ msg: -11 });
        } else {
          let albumLiked = {id: albumId, rate: -1}
          await users.updateOne({username:username},{$push: {liked: albumLiked}});
          return res.status(200).json({ msg: 11 });
        }
      } 
    } else {
      return res.status(400).json({ message: 'User must be logged' });
    }
  } catch(error){
    console.error(error.message)
    return res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/follow-unfollow-artist', authUser, async (req, res) => {
  const username = req.user.username;
  const dataArtist = req.body.artistToFollow;
  const artistId = dataArtist[0];
  try {
    const users = client.db('Listenerd').collection('users'); 
    const artists = client.db('Listenerd').collection('artists'); 
    let user = await users.findOne({username});
    if(user != null){
      let artist = await artists.findOne({idArtist: artistId});
      if(artist == null){
        const artistObject = new Artist(artistId,dataArtist[1],dataArtist[2],1)
        await artists.insertOne(artistObject);
      } 
      artist = await artists.findOne({idArtist: artistId});
      if(artist.picture == null){
        await artists.updateOne({idArtist:artistId}, {$set:{picture: dataArtist[2]}})
      }
      let newNbOfFollowers = 0;
      let flag = 0;
      if(user.artistFollowed != null && user.artistFollowed != [] && user.artistFollowed.includes(artistId)){
        await users.updateOne({username:username},{$pull: {artistFollowed: artistId}});
        newNbOfFollowers = artist.followersListenerd - 1;
        flag = 0;
      } else {
        await users.updateOne({username:username}, {$push:{artistFollowed: artistId}})
        newNbOfFollowers = artist.followersListenerd + 1;
        flag = 1;
      }
      await artists.updateOne({idArtist:artistId}, {$set:{followersListenerd: Number(newNbOfFollowers)}})
      return res.status(200).json({ message: flag})
    } else {
      return res.status(400).json({ message: 'User must be logged' });
    }
  } catch(error){
    console.error(error.message)
    return res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/check-follow', authUser, async (req, res) => {
  const username = req.user.username;
  const artistId = req.body.artistId[0];
  let ret = -1;
  try {
    const users = client.db('Listenerd').collection('users'); 
    let user = await users.findOne({username});
    if(user != null){
      if(user.artistFollowed != null && Array.isArray(user.artistFollowed) && (user.artistFollowed.includes(artistId))){
        ret = 1;
      } else {
        ret = 0;
      }
      return res.status(200).json({ message: ret})
    } else {
      return res.status(400).json({ message: 'User must be logged' });
    }
  } catch(error){
    console.error(error.message)
    return res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * If in wish list : 0
 * If in liked list : 1
 * If in both : 2
 * If in any : -1
 */
app.post('/check-list', authUser, async (req, res) => {
  const username = req.user.username;
  const albumId = req.body.albumId[0];
  let ret = -1;
  try {
    const users = client.db('Listenerd').collection('users'); 
    let user = await users.findOne({username});
    if(user != null){
      if(user.liked != null && Array.isArray(user.liked) && (user.liked.some(album => album.id === albumId))){
        ret = {res: 1, rate: user.liked.find(album => album.id === albumId).rate};
      } 

      if(user.toListen != null && Array.isArray(user.toListen) && (user.toListen.includes(albumId))){
        if(ret != 1){
          ret = {res: 2, rate: user.liked.find(album => album.id === albumId).rate};
        } else {
          ret = 0;
        }
      } 
      return res.status(200).json({ message: ret})
    } else {
      return res.status(400).json({ message: 'User must be logged' });
    }
  } catch(error){
    console.error(error.message)
    return res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/change-rate', authUser, async (req, res) => {
  const username = req.user.username;
  const albumId = req.body.dataToSend[0];
  const newRate = req.body.dataToSend[1];
  try {
    const users = client.db('Listenerd').collection('users'); 
    let user = await users.findOne({username});
    if(user != null){
      if(user.liked != null && Array.isArray(user.liked) && (user.liked.some(album => album.id === albumId))){
        await users.updateOne({username: username,'liked.id': albumId}, {$set: {'liked.$.rate': newRate}});
      } 
      return res.status(200).json({ message: 1})
    } else {
      return res.status(400).json({ message: 'User must be logged' });
    }
  } catch(error){
    console.error(error.message)
    return res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/change-country', authUser, async (req, res) => {
  const username = req.user.username;
  const newCountry = req.body.dataToSend;
  try {
    const users = client.db('Listenerd').collection('users'); 
    let user = await users.findOne({username});
    if(user != null){
      await users.updateOne({username: username}, {$set: {'country': newCountry}});
      return res.status(200).json({ message: 1})
    } else {
      return res.status(400).json({ message: 'User must be logged' });
    }
  } catch(error){
    console.error(error.message)
    return res.status(500).json({ msg: 'Server error' });
  }
});

//code 
app.listen(port, () => {
  console.log(`Server side is running on localhost:${port}`);
});