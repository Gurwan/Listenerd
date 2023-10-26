<template>
  <div>
    <main-navbar></main-navbar>
    <div class="main-div-artist">
      <div class="artist-side-div">
        <sync-loader v-if="!artistData.length" :loading="loading" :color="color" :size="size"></sync-loader>
        <div v-else>
          <div class="artist-details-div">
            <img :src="artistData[2]" alt="Artist picture" class="artist_picture">
            <h1 class="text-2xl font-bold">{{ artistData[1] }}</h1> 
            <p class="text-lg">{{ artistData[3] }} followers on Spotify and have a popularity of {{artistData[4]}}/100</p> 
            <p class="text-lg">{{ artistData[6] }} follower(s) on Listenerd</p>
            <p class="text-lg">{{ artistData[5] }}</p>
            <a v-if="isAuth" class="text-white hover:text-blue-300 followA" href="#" @click="followUnfollowArtist">
              <p v-if="followStatus == 0" class="text-lg">Follow {{ artistData[1] }} to be aware of these new releases</p>
              <p v-else class="text-lg">Stop following {{ artistData[1] }} </p>
              <i v-if="followStatus == 0" class="fa-solid fa-square-plus fa-2xl icon-follow-artist"> FOLLOW</i>
              <i v-else class="fa-solid fa-square-plus fa-2xl icon-follow-artist"> UN FOLLOW</i>
            </a>
            <div class="items-center justify-center" id="spotifyPlayerDiv"></div>
          </div>
          <div class="albums-grid" id="grid-albums">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>  
  
<script>
import axios from 'axios';
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'

import MainNavbar from './MainNavbar.vue'
export default {
  components: {
    "main-navbar": MainNavbar,
    SyncLoader, 
  },
  data() {
    return {
      artistData: [],
      followStatus: 0,
      isAuth: false,
    };
  },
  created() {
    const isAuthToken = localStorage.getItem('jwt_token');
    if(isAuthToken){
      this.isAuth = true;
    } else {
      this.isAuth = false;
    }

    const artistId = this.$route.params.id;
    this.getArtistData(artistId); 
  },
  methods: {
    //0 means artist not followed 1 means already followed
    checkFollowStatus(){
      const userId = localStorage.getItem('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      const artistId = [this.artistData[0]]
      axios.post('http://localhost:3001/check-follow', {artistId})
        .then(response => {
          this.followStatus = response.data.message;
        })
        .catch(error => {
          if(error != null){
            this.$router.push('/logout') 
          }
        });
    },
    followUnfollowArtist(){
      const userId = localStorage.getItem('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      //number of followers = 0 if the artist isn't in the db
      const artistToFollow = [this.artistData[0],this.artistData[1],this.artistData[2]]
      axios.post('http://localhost:3001/follow-unfollow-artist', {artistToFollow})
        .then(response => {
          this.followStatus = response.data.message;
          if(this.followStatus == 0){
            this.artistData[6] = this.artistData[6] - 1;
          } else {
            this.artistData[6] = this.artistData[6] + 1;

          }
        })
        .catch(error => {
          if(error != null){
            this.$router.push('/logout') 
          }
        });
    },
    getArtistData(artistId) {
      axios.get(`http://localhost:3001/artist?artistId=${artistId}`)
        .then(response => {
          this.artistData = response.data[0];
          if(this.isAuth){
            this.checkFollowStatus();
          }
          this.loadAllAlbumsOfArtist(response.data[1])
          this.loadSpotifyPlayer(response.data[2])
        })
        .catch(error => {
          console.error('API error:', error);
        });
    },
    loadSpotifyPlayer(trackId){
      //wait for vuejs rerender the page and the full loading of the data
      this.$nextTick(() => {
        const spotifyDiv = document.getElementById('spotifyPlayerDiv');
        const iframe = document.createElement('iframe');
        iframe.src = `https://open.spotify.com/embed/track/${trackId}`;
        spotifyDiv.appendChild(iframe);
      })
    },
    loadAllAlbumsOfArtist(albums){
      this.$nextTick(() => {
        const gridAlbums = document.getElementById('grid-albums');
        let i = 0;
        while(i<albums.length){
          const albumElement = document.createElement('div');
          albumElement.classList.add('p-4', 'flex', 'flex-col', 'items-center');

          const cover = document.createElement('img');
          cover.setAttribute('src', albums[i][3]);
          cover.setAttribute('alt', 'Image');
          cover.classList.add('max-w-full', 'h-auto', 'w-64', 'md:w-48', 'lg:w-32', 'xl:w-24', 'mb-2', 'mx-auto');
          
          const routerLink = document.createElement('a')
          routerLink.setAttribute("href", "/album/"+ albums[i][0]);
          const title = document.createElement('p');
          title.classList.add('font-bold');
          title.textContent = albums[i][1];
          routerLink.appendChild(cover);
          routerLink.appendChild(title);

          const year = document.createElement('p');
          year.classList.add('text-gray-600');
          year.textContent = `${this.artistData[1]} - ${albums[i][2]}`;

          albumElement.appendChild(routerLink);
          albumElement.appendChild(year);

          gridAlbums.appendChild(albumElement);
          i = i+1
        }
      })
    },
    
  },
};
</script>

<style scoped>
@import '../assets/styles/artist-style.css';
</style>
