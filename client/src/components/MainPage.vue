<template>
  <div>
    <main-navbar @search-text-changed="searchAlbumsArtists" @instantText="instantSearch"></main-navbar>
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
          <div v-if="isAuth">
            <div v-if="data[3] == 0">
              <button @click="follow(data)" class="button-follow-artist font-bold py-2 px-4 rounded inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                </svg>
                <span>Follow</span>
              </button>   
            </div>
            <div v-else>
              <button @click="follow(data)" class="button-follow-artist font-bold py-2 px-4 rounded inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
                </svg>
                <span>Unfollow</span>
              </button>   
            </div>
          </div>
        </div>
      </div>
      <div v-if="userValues.length >= 1" class="grid-home">
        <div v-for="data in userValues" :key="data[0]" class="p-4 flex flex-col items-center">
          <div v-if="data[0] != this.usernameConnected">
            <router-link  :to="'/user/' + data[0]" >
              <img :src="loadPhoto(data[1]) || require('@/assets/images/empty_pp.jpg')" alt="Image" class="img-artist"> 
              <p class="font-bold">{{ data[0] }}</p>
            </router-link>
          </div>
          <div v-else>
            <router-link  :to="'/profile/'" >
              <img :src="loadPhoto(data[1]) || require('@/assets/images/empty_pp.jpg')" alt="Image" class="img-artist"> 
              <p class="font-bold">{{ data[0] }}</p>
            </router-link>
          </div>

          <div v-if="isAuth && data[0] != this.usernameConnected">
            <a class="text-white hover:text-blue-300 aList" href="#" @click="handleFriendship(data)">
                    <i v-if="data[2] == 0" class="fa-solid fa-user-plus fa-2xl icon-add-album"></i>
                    <i v-else class="fa-solid fa-user-xmark fa-2xl icon-add-album"></i>
            </a>
          </div>
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
      userValues: [],
      searchText: '',
      isAuth: false,
      usernameConnected: null,
      instantResult: [],
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
      axios.get(`http://localhost:3001/search?search=${searchText}&field=${searchField}&limit=50`)
        .then((response) => {
          if(response.data.field == 'album'){
            this.refreshData(response.data.arrayAlbum)
          } else if(response.data.field == 'artist'){
            this.refreshArtistData(response.data.arrayArtist)
          } else if(response.data.field == 'user'){
            this.refreshUserList(response.data.returnUsers)
          }
        })
        .catch(error => {
          console.error('API request error :', error);
        });
    },
    getUsername(){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      axios.get(`http://localhost:3001/username`)
        .then((response) => {
          this.usernameConnected = response.data.message;
        })
        .catch(error => {
          console.error('API request error :', error);
        });
    },
    instantSearch(searchText,searchField,mobile){
      let ulElement = document.getElementById('ulInstantResult');
      if(mobile){
        ulElement = document.getElementById('ulInstantResultM');
      }
      if(searchText.length>=1){
        axios.get(`http://localhost:3001/search?search=${searchText}&field=${searchField}&limit=6`)
        .then(async (response) =>  {
          if(response.data.field == 'album'){
            this.instantResult = response.data.arrayAlbum
          } else if(response.data.field == 'artist'){
            this.instantResult = response.data.arrayArtist
          } else if(response.data.field == 'user'){
            this.instantResult = response.data.returnUsers
            const userId = this.$cookies.get('jwt_token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
            axios.get(`http://localhost:3001/username`)
              .then((response) => {
                this.usernameConnected = response.data.message;
                if(ulElement != null){
                  while (ulElement.firstChild) {
                    ulElement.removeChild(ulElement.firstChild);
                  }
                  for(let i in this.instantResult){
                    var li = document.createElement("li");
                    var a = document.createElement("a");
                    a.appendChild(document.createTextNode(this.instantResult[i][0]));
                    if(this.instantResult[i][0] == this.usernameConnected){
                      a.href = `/profile/`
                    } else {
                      a.href = `/${searchField}/${this.instantResult[i][0]}`
                    }
                    li.appendChild(a);
                    ulElement.appendChild(li);
                  }
                }
              })
              .catch(error => {
                console.error('API request error :', error);
              });
          }        
          if(ulElement != null && searchField != 'user'){
            while (ulElement.firstChild) {
              ulElement.removeChild(ulElement.firstChild);
            }
            for(let i in this.instantResult){
              var li = document.createElement("li");
              var a = document.createElement("a");
              a.appendChild(document.createTextNode(this.instantResult[i][1]));
              a.href = `/${searchField}/${this.instantResult[i][0]}`
              li.appendChild(a);
              ulElement.appendChild(li);
            }
          }
        })
        .catch(error => {
          console.error('API request error :', error);
        });
      } else {
        while (ulElement.firstChild) {
          ulElement.removeChild(ulElement.firstChild);
        }
      }
    },
    handleFriendship(data){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      const withUserId = data[0]
      axios.post('http://localhost:3001/friend/', {withUserId})
            .then((response) => {
              if(response.data.message == 0){
                this.userValues[this.userValues.indexOf(data)][2] = 0;
              } else if(response.data.message == 1){
                this.userValues[this.userValues.indexOf(data)][2] = 1;
              } 
            })
            .catch(error => {
                console.error('API request error :', error);
          });
    },
    refreshArtistData(response) {
      const allData = response;
      if (Array.isArray(allData) && allData.length > 0) {
        this.albumsValues = [];
        this.userValues = [];
        if(this.isAuth){
          const userId = this.$cookies.get('jwt_token');
          axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
          axios.post('http://localhost:3001/artist-user/', {allData})
            .then((response) => {
              const dataWithList = response.data.message;
              this.artistValues = dataWithList;
            })
            .catch(error => {
                console.error('API request error :', error);
          });
        } else {
          this.artistValues = allData;
        }
      } else {
        console.error('API data error');
      } 
    },
    refreshUserList(response){
      const allData = response;
      if (Array.isArray(allData) && allData.length > 0) {
        this.albumsValues = [];
        this.artistValues = [];
        if(this.isAuth){
          const userId = this.$cookies.get('jwt_token');
          axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
          axios.post('http://localhost:3001/friends/', {allData})
            .then((response) => {
              const dataWithList = response.data.message;
              this.getUsername();
              this.userValues = dataWithList;
            })
            .catch(error => {
                console.error('API request error :', error);
          });
        } else {
          this.userValues = allData;
        }
      } else {
        console.error('API data error');
      } 
    },
    loadPhoto(data){
      if(data == null){
        return null
      }
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.contentType });
      return URL.createObjectURL(blob);
    },
    refreshData(response) {
      const allData = response;
      if (Array.isArray(allData) && allData.length > 0) {
        this.artistValues = [];
        this.userValues = [];
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
    follow(data){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;

      const artistToFollow = [data[0],data[1],data[2]]
      axios.post('http://localhost:3001/artist', {artistToFollow})
        .then(response => {
          if(response.data.message == 0){
            this.artistValues[this.artistValues.indexOf(data)][3] = 0;
          } else if(response.data.message == 1){
            this.artistValues[this.artistValues.indexOf(data)][3] = 1;
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