<template>
  <div>
    <div>
      <main-navbar></main-navbar>
      <div id="main-div">
        <div id="left-side" class="justify-center">
            <div class="flex w-full justify-center">
                <scale-loader v-if="!albumData.length" :loading="loading" :color="color" :size="size"></scale-loader>
                <div v-else>
                  <img :src="albumData[3]" alt="Album cover" class="cover-album">
                  <h1 class="text-2xl font-bold">{{ albumData[1] }}</h1>
                  <router-link :to="'/artist/' + albumData[2][0]">
                    <p class="text-xl">{{ albumData[2][1] }}</p>
                  </router-link>
                  <span class="font-semibold">{{ albumData[7] }}</span>
                  <p class="text-lg">{{ albumData[6] }} - {{ albumData[4] }}</p>
                  <div v-if="isAuth">
                    <a class="text-white hover:text-blue-300 aList" href="#" @click="addAlbumToList(0)">
                      <i v-if="alreadyToListen" class="fa-solid fa-folder fa-2xl icon-add-album"></i>
                      <i v-else class="fa-solid fa-folder-plus fa-2xl icon-add-album"></i>
                    </a>
                    <a class="text-white hover:text-blue-300 aList" href="#" @click="addAlbumToList(1)">
                      <i v-if="alreadyLiked" class="fa-solid fa-heart fa-2xl icon-add-album"></i>
                      <i v-else class="fa-regular fa-heart fa-2xl icon-add-album"></i>
                    </a>
                  </div>
                  <div v-if="isAuth && alreadyLiked" class="rate-div" id="rate-div">
                    <i class="fa-solid fa-star"></i>
                    <input type="number" min="0" :max="params.limit" step="0.5" placeholder="0" id="input-rate" class="text-center input-rate" v-model="rate" @input="rateChange"/>
                    <span v-if="params.scale != 'empty'" class="span20">{{params.scale}}</span>
                  </div>
                  <div v-if="isAuth" class="rate-friends">
                      <p id="rate-friend-p">Rate of your friends</p>
                      <div class="list-friends" id="friend-with">
            
                      </div>
                  </div>
                </div>
            </div>
        </div>
        <div id="right-side" class="justify-center">
            <div class="w-full flex justify-center">
              <scale-loader v-if="!albumData.length" :loading="loading" :color="color" :size="size"></scale-loader>
              <div v-else>
                <p class="font-semibold">Tracklist :</p>
                <ul>
                  <li v-for="(track, i) in albumData[8]" :key="i">
                    #{{track.track_number}} - {{track.name}}
                  </li>
                </ul>
                <div class="mt-4 items-center justify-center" >
                  <div class="items-center justify-center" id="spotifyPlayerDiv"></div>
                </div>
              </div>
            </div>
        </div>
    </div>
    </div>
  </div>
</template>

  
<script>
import axios from 'axios';
import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue';
import MainNavbar from './MainNavbar.vue'

export default {
  components: {
    "main-navbar": MainNavbar,
    ScaleLoader, 
  },
  data() {
    return {
      albumData: [],
      isAuth: false,
      alreadyLiked: false,
      alreadyToListen: false,
      rate: 0,
      params: null,
      rateFriends: []
    };
  },
  created(){
    const isAuthToken = this.$cookies.get('jwt_token');
    if(isAuthToken){
      this.isAuth = true;
    } else {
      this.isAuth = false;
    }

    const albumId = this.$route.params.id;
    this.getAlbumData(albumId); 
  },
  methods: {
    checkStatus(){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      const albumId = [this.albumData[0]]
      axios.post('http://localhost:3001/check-list', {albumId})
        .then(response => {
          if(response.data.params != undefined && response.data.params != null){
            this.params = response.data.params;
            if(this.params.scale != null){
              if(this.params.scale == 'empty'){
                this.params.limit = null;
              } else {
                const scaleValue = this.params.scale.split(" ")[1];
                const scaleValueNb = Number(scaleValue);
                this.params.limit = scaleValueNb;
              }
            }
          }
          if(response.data.message == 0){
            this.alreadyToListen = true;
            this.alreadyLiked = false;
          } else if(response.data.message != -1) {
            this.rate = response.data.message.rate;
            if(this.rate == -1){
              this.rate = 0;
            }

            if(response.data.message.res == 1){
              this.alreadyLiked = true;
              this.alreadyToListen = false;
            } else {
              this.alreadyToListen = true;
              this.alreadyLiked = true;
            }
          }
          this.$nextTick(() => {
              if(this.rate != 0){
                let divRate = document.getElementById("rate-div");

                if(this.rate >= this.params.gap[0][0] && this.rate < this.params.gap[0][1]){
                  divRate.style.borderColor = this.params.gap[0][2];
                } else if(this.rate >= this.params.gap[1][0] && this.rate <= this.params.gap[1][1]){
                  divRate.style.borderColor = this.params.gap[1][2];
                } else if(this.rate >= this.params.gap[2][0] && this.rate <= this.params.gap[2][1]) {
                  divRate.style.borderColor = this.params.gap[2][2];
                } else if(this.rate >= this.params.gap[3][0] && this.rate <= this.params.gap[3][1]) {
                  divRate.style.borderColor = this.params.gap[3][2];
                }
              }
            });
        })
        .catch(error => {
        if(error != null){
            //this.$router.push('/logout') 
            console.log(error)
          }
        });
    },
    rateChange(){    
      let divRate = document.getElementById("rate-div");
      if(this.rate >= this.params.gap[0][0] && this.rate < this.params.gap[0][1]){
        divRate.style.borderColor = this.params.gap[0][2];
      } else if(this.rate >= this.params.gap[1][0] && this.rate <= this.params.gap[1][1]){
        divRate.style.borderColor = this.params.gap[1][2];
      } else if(this.rate >= this.params.gap[2][0] && this.rate <= this.params.gap[2][1]) {
        divRate.style.borderColor = this.params.gap[2][2];
      } else if(this.rate >= this.params.gap[3][0] && this.rate <= this.params.gap[3][1]) {
        divRate.style.borderColor = this.params.gap[3][2];
      }
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      const dataToSend = [this.albumData[0], this.rate]
      axios.put('http://localhost:3001/rate', {dataToSend})
        .then(response => {
          console.log(response);
        })
        .catch(error => {
        if(error != null){
          console.log(error)
          this.$router.push('/logout') 
        }
      });
    },
    getRateFriends(albumId){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      axios.get(`http://localhost:3001/friends-rate?albumId=${albumId}`)
        .then(response => {
          this.rateFriends = response.data.message;
          var friendElement = document.getElementById("friend-with");
          var ul = document.createElement("ul");
          this.rateFriends.forEach(function(user) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            var p = document.createElement("p");
            if(user[2] != -1){
              p.textContent = user[2];
            } else {
              return;
            }
            if(user[0].length > 10){
              a.textContent = user[0].substring(0, 10);
            } else {
              a.textContent = user[0];
            }
            a.href = '/user/' + user[0]
            var img = document.createElement("img");
            if(user[1] != null){
              let byteCharacters = atob(user[1].data);
              let byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              let byteArray = new Uint8Array(byteNumbers);
              let blob = new Blob([byteArray], { type: user[1].contentType });
              img.src = URL.createObjectURL(blob);
            } else {
              img.src = require('@/assets/images/empty_pp.jpg');
            }
            img.classList.add("img-user-preview")
            a.appendChild(img)
            a.classList.add("a-user-preview")
            li.appendChild(a)
            li.appendChild(p)
            ul.appendChild(li);
          });
          if(this.rateFriends.length == 0){
            var li = document.createElement("li");
            var p = document.createElement("p");
            p.textContent = "You don't have friend who liked this album";
            li.appendChild(p);
            ul.appendChild(li);
          }
          friendElement.appendChild(ul);
        })
        .catch(error => {
          console.error('API error:', error);
        });
    },
    getAlbumData(albumId) {
      axios.get(`http://localhost:3001/album?albumId=${albumId}`)
        .then(response => {
          this.albumData = response.data;
          if(this.isAuth){
            this.checkStatus();  
            this.getRateFriends(albumId);        
          }
          const randomTrack = response.data[8][Math.floor(Math.random() * response.data[8].length)];
          this.loadSpotifyPlayer(randomTrack.id)
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

    /**
     * Add album to either the liked list or the to listen list of the user
     * @param {Integer} arg 0 if user wants to add album to his to listen list and 1 if he wants to add to it to his liked list
     */
     addAlbumToList(list){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      //required data to show the album in lists : id of album, name, id of main artist, cover and release date
      //only the id will be used if the album is already in the db
      const albumDataToInsertInDB = [this.albumData[0],this.albumData[1],this.albumData[2],this.albumData[3],this.albumData[4]]
      axios.post('http://localhost:3001/album', {albumDataToInsertInDB,list})
        .then(response => {
          if(response.data.message == -10){
            this.alreadyToListen = false;
          } else if(response.data.message == 10){
            this.alreadyToListen = true;
          } else if(response.data.message == -11){
            this.alreadyLiked = false;
            this.rate = 0;
          } else if(response.data.message == 11){
            this.alreadyLiked = true;
          } else {
            console.log(response.data)
          }  
        })
        .catch(error => {
          if(error != null){
            //this.$router.push('/logout') 
          }
        });
    },
  },
};
</script>

<style scoped>
@import '../assets/styles/album-style.css';
</style>

