<template>
  <div>
    <main-navbar @search-text-changed="searchAlbumsArtists"></main-navbar>
    <div>
      <div v-if="albumsValues.length >= 1" class="grid-home">
        <div v-for="data in albumsValues" :key="data[0]" class="p-4 flex flex-col items-center">
          <router-link  :to="'/album/' + data[0]" >
            <img :src="data[3]" alt="Image" class="max-w-full h-auto w-64 md:w-48 lg:w-32 xl:w-24 mb-2 mx-auto"> 
            <p class="font-bold">{{ data[1] }}</p>
            <p class="text-gray-600">{{ data[2][1] }} - {{ data[4] }}</p>
          </router-link>
          <div v-if="isAuth">
                <a class="text-white hover:text-blue-300 aList" href="#" @click="addAlbumToList(data,0)">
                    <i v-if="data[5]" class="fa-solid fa-folder fa-2xl icon-add-album"></i>
                    <i v-else class="fa-solid fa-folder-plus fa-2xl icon-add-album"></i>
                </a>
                <a class="text-white hover:text-blue-300 aList" href="#" @click="addAlbumToList(data,1)">
                    <i v-if="data[6]" class="fa-solid fa-heart fa-2xl icon-add-album"></i>
                    <i v-else class="fa-regular fa-heart fa-2xl icon-add-album"></i>
                </a>
          </div>
        </div>
      </div>
      <div v-if="artistValues.length >= 1" class="grid-home">
        <div v-for="data in artistValues" :key="data[0]" class="p-4 flex flex-col items-center">
          <router-link  :to="'/artist/' + data[0]" >
            <img :src="data[2]" alt="Image" class="img-artist"> 
            <p class="font-bold">{{ data[1] }}</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import MainNavbar from './MainNavbar.vue'
import axios from 'axios';
export default {
  components: {
    "main-navbar": MainNavbar
  },
  data() {
    return {
      albumsValues: [],
      artistValues: [],
      searchText: '',
      isAuth: false,
    };
  },
  created(){
    const isAuthToken = this.$cookies.get('jwt_token');
    if(isAuthToken){
      this.isAuth = true;
    } else {
      this.isAuth = false;
    }
  },
  methods: {
    searchAlbumsArtists(searchText,searchField) {
      console.log("ca commence à chercher")
      axios.get(`http://localhost:3001/search?search=${searchText}&field=${searchField}`)
        .then((response) => {
          console.log(response)
          if(response.data.field == 'album'){
            this.refreshData(response.data.arrayAlbum)
          } else if(response.data.field == 'artist'){
            this.refreshArtistData(response.data.arrayArtist)
          }
        })
        .catch(error => {
          console.error('API request error :', error);
        });
    },
    refreshArtistData(response) {
      const allData = response;
      console.log(allData)
      if (Array.isArray(allData) && allData.length > 0) {
        this.albumsValues = [];
        this.artistValues = allData;
      } else {
        console.error('API data error');
      } 
    },
    refreshData(response) {
      const allData = response;
      if (Array.isArray(allData) && allData.length > 0) {
        this.artistValues = [];
        if(this.isAuth){
          const userId = this.$cookies.get('jwt_token');
          axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
          axios.post('http://localhost:3001/album-user/', {allData})
            .then((response) => {
              const dataWithList = response.data.message;
              this.albumsValues = dataWithList;
            })
            .catch(error => {
                console.error('API request error :', error);
          });
        } else {
          this.albumsValues = allData;
        }
      } else {
        console.error('API data error');
      }
    },
    /**
     * Add album to either the liked list or the to listen list of the user
     * @param {Integer} arg 0 if user wants to add album to his to listen list and 1 if he wants to add to it to his liked list
     */
     addAlbumToList(data,list){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      //required data to show the album in lists : id of album, name, id of main artist, cover and release date
      //only the id will be used if the album is already in the db
      const albumDataToInsertInDB = [data[0],data[1],data[2][0],data[3],data[4]]
      axios.post('http://localhost:3001/album', {albumDataToInsertInDB,list})
        .then(response => {
          if(response.data.message == -10){
            this.albumsValues[this.albumsValues.indexOf(data)][5] = 0;
          } else if(response.data.message == 10){
            this.albumsValues[this.albumsValues.indexOf(data)][5] = 1;
          } else if(response.data.message == -11){
            this.albumsValues[this.albumsValues.indexOf(data)][6] = 0;
            this.rate = 0;
          } else if(response.data.message == 11){
            this.albumsValues[this.albumsValues.indexOf(data)][6] = 1;
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
  mounted() {
    const userId = this.$cookies.get('jwt_token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
    axios.get('http://localhost:3001/new-releases')
    .then((response) => this.refreshData(response.data))
    .catch(error => {
          console.error('API request error :', error);
    });
  },
}
</script>

<style>
@import '../assets/styles/home-style.css';
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
</style>