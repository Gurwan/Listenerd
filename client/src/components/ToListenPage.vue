<template>
  <div>
      <main-navbar></main-navbar>
      <div class="filter-bar">
        <div class="filterby-div">
          <p>FILTER BY</p>
          <select class="bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected value="">YEAR</option>
            <option></option>
          </select>
          <select class="bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected value="">ARTIST</option>
            <option></option>
          </select>
        </div>
        <div class="sortby-div">
          <p>SORT BY</p>
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="sortBy(1)">Title</button>
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="sortBy(4)">Release date</button>
        </div>
        <div class="hide-div">
          <p id="hide-p">SHOW</p>
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="hideShow">Buttons</button>
        </div>
      </div>
      <div class="grid-list">
        <div v-for="data in sortAlbumsList" :key="data[0]" class="p-4 flex flex-col items-center">
          <router-link  :to="'/album/' + data[0]">
            <img :src="data[3]" alt="Image" class="max-w-full h-auto w-64 md:w-48 lg:w-32 xl:w-24 mb-2 mx-auto"> 
            <p class="font-bold">{{ data[1] }}</p>
            <p class="text-gray-600">{{ data[2][1] }} - {{ data[4] }}</p>
          </router-link>
          <div v-if="listButton">
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
      <div v-if="sortAlbumsList.length">
        <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="clearToListenList">
          <i style="padding: 1rem;" class="fa-solid fa-trash"></i> <span style="padding:1rem">Clear your to listen albums list</span></button>
      </div>
  </div>
</template>

<script>
import axios from 'axios';
import MainNavbar from './MainNavbar.vue';
export default {
components: {
  "main-navbar": MainNavbar
},
data() {
  return {
    albumsValues: [],
    sort: {by: null, order:'asc'},
    listButton: false
  };
},
created(){
  const userId = this.$cookies.get('jwt_token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;

  axios.get('http://localhost:3001/list?list=0')
    .then(response => {
      const allData = response.data;
      if (Array.isArray(allData) && allData.length > 0) {
        this.albumsValues = allData;
      } else {
        console.error('API data error');
      }
    })
    .catch(error => {
        if(error != null){
          this.$router.push('/logout') 
        }
    });
},
computed: {
    sortAlbumsList(){
      return this.sortList();
    }
},
methods: {
    clearToListenList(){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      axios.delete('http://localhost:3001/to-listen-list')
      .then(response => {
          console.log(response);
          location.reload();
      })
      .catch(error => {
        if(error != null){
          console.log(error)
          //this.$router.push('/logout') 
        }        
      });
    },
    sortBy(arg){
      if(arg == this.sort.by){
        if(this.sort.order == 'asc'){
          this.sort.order = 'desc';
        } else {
          this.sort.order = 'asc';
        }
      } else {
        this.sort.by = arg;
        this.sort.order = 'asc';
      }
    },
    sortList(){
      if(this.sort.by == null){
        return this.albumsValues;
      } else {
        return this.albumsValues.slice().sort((a,b) => {
          let rateA = a[this.sort.by];
          let rateB = b[this.sort.by];
          if(this.sort.order == 'asc'){
            return rateA.localeCompare(rateB);
          } else {
            return -(rateA.localeCompare(rateB));
          }
        })
      }
    },
    hideShow(){
      if(this.listButton){
        document.getElementById("hide-p").innerText = "SHOW";
        this.listButton = false;
      } else {
        document.getElementById("hide-p").innerText = "HIDE";
        this.listButton = true;
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
            this.albumsValues.splice(this.albumsValues.indexOf(data),1);
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
    }
  }
};
</script>
<style scoped>
@import '../assets/styles/list-style.css';
</style>
  