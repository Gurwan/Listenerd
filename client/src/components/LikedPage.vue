<template>
  <div>
      <main-navbar></main-navbar>
      <div class="filter-bar">
        <div class="filterby-div">
          <p>FILTER</p>
          <select @change="changeYearFilter" id="selectYear" class="bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected value="defaultValue">BY YEAR</option>
          </select>
          <select @change="changeArtistFilter" id="selectArtist" class="bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected value="defaultValue">BY ARTIST</option>
          </select>
        </div>
        <div class="sortby-div">
          <p>SORT BY</p>
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="sortBy(1)">Title</button>
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="sortBy(4)">Release date</button>
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="sortBy(5)">Your rating</button>
        </div>
        <div class="hide-div">
          <p id="hide-p">SHOW</p>
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="hideShow">Buttons</button>
        </div>
      </div>
      <div class="grid-list">
        <div v-for="data in sortAndFilterAlbumsList" :key="data[0]" class="p-4 flex flex-col items-center">
          <router-link :to="'/album/' + data[0]" >
            <img :src="data[3]" alt="Image" class="max-w-full h-auto w-64 md:w-48 lg:w-32 xl:w-24 mb-2 mx-auto"> 
            <p class="font-bold">{{ data[1] }}</p>
            <p class="text-gray-600">{{ data[2][1] }} - {{ data[4] }}</p>
            <p v-if="data[5] != -1 && params.scale != 'empty'" class="font-bold rate-value-id">{{ data[5] }} {{ params.scale }}</p>
            <p v-if="data[5] != -1 && params.scale == 'empty'" class="font-bold rate-value-id">{{ data[5] }}</p>
          </router-link>
          <div v-if="listButton">
              <a class="text-white hover:text-blue-300 aList" href="#" @click="addAlbumToList(data,0)">
                  <i v-if="data[6]" class="fa-solid fa-folder fa-2xl icon-add-album"></i>
                  <i v-else class="fa-solid fa-folder-plus fa-2xl icon-add-album"></i>
              </a>
              <a class="text-white hover:text-blue-300 aList" href="#" @click="addAlbumToList(data,1)">
                  <i v-if="data[7]" class="fa-solid fa-heart fa-2xl icon-add-album"></i>
                  <i v-else class="fa-regular fa-heart fa-2xl icon-add-album"></i>
              </a>
          </div>
        </div>
      </div>
      <div v-if="sortAndFilterAlbumsList.length">
        <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="clearLikedList">
          <i style="padding: 1rem;" class="fa-solid fa-trash"></i> <span style="padding:1rem">Clear your liked albums list</span></button>
      </div>
  </div>
</template>

<script>
import axios from 'axios';
import MainNavbar from './MainNavbar.vue'
export default {
components: {
  "main-navbar": MainNavbar
},
data() {
  return {
    albumsValues: [],
    params: null,
    sort: {by: null, order:'asc'},
    listButton: false,
    filterYear: null,
    filterArtist: null
  };
},
created(){
  const userId = this.$cookies.get('jwt_token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;

  axios.get('http://localhost:3001/list?list=1')
    .then(response => {
      this.params = response.data.userParams;
      const allData = response.data.resultLiked;
      if (Array.isArray(allData) && allData.length > 0) {
        this.albumsValues = allData;
        let yearList = []
        let artistList = []
        for(let a in allData){
          let year = allData[a][4].split("-")[0]
          yearList.push(year);
          artistList.push(allData[a][2][1])
        }
        const yearListUnique = new Set(yearList);
        const artistListUnique = new Set(artistList);
        const selectYear = document.getElementById("selectYear");
        const selectArtist = document.getElementById("selectArtist");
        let artistSortedArray = Array.from(artistListUnique).sort();
        let yearSortedArray = Array.from(yearListUnique).sort((a, b) => b - a);

        for (const y of yearSortedArray) {
          let option = document.createElement("option");
          option.value = y;
          option.text = y;
          selectYear.appendChild(option);
        }

        for (const a of artistSortedArray) {
          let option = document.createElement("option");
          option.value = a;
          option.text = a;
          selectArtist.appendChild(option);
        }
      } else {
        console.error('API data error');
      }
    })
    .catch(error => {
        if(error != null){
          this.$router.push('/logout') 
          console.log(error)
        }
    });
  },
  computed: {
    sortAndFilterAlbumsList(){
      const retSort = this.sortList();
      if(this.filterArtist == null && this.filterYear == null){
        return retSort;
      } else {
        return this.filterList(retSort);
      }
    }
  },
  methods: {
    clearLikedList(){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      axios.delete('http://localhost:3001/liked-list')
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

          if(this.sort.by == 5){
            if(this.sort.order == 'asc'){
              return rateA - rateB;
            } else {
              return rateB - rateA;
            }
          } else {
            if(this.sort.order == 'asc'){
              return rateA.localeCompare(rateB);
            } else {
              return -(rateA.localeCompare(rateB));
            }
          }
        })
      }
    },
    changeYearFilter(e){
      const v = e.target.value;
      if(v == "defaultValue"){
        this.filterYear = null;
      } else {
        this.filterYear = v;
      }
    },
    changeArtistFilter(e){
      const v = e.target.value;
      if(v == "defaultValue"){
        this.filterArtist = null;
      } else {
        this.filterArtist = v;
      }
    },
    filterList(list){
      let retList = []
      for(let a in list){
        if(this.filterYear != null){
          if(list[a][4].split("-")[0] == this.filterYear){
            if(this.filterArtist == null){
              retList.push(list[a]);
            } else {
              if(list[a][2][1] == this.filterArtist){
                retList.push(list[a]);
              }
            }
          }
        } else if(this.filterArtist != null){
          if(list[a][2][1] == this.filterArtist){
            if(this.filterYear == null){
              retList.push(list[a]);
            } else {
              if(list[a][4].split("-")[0] == this.filterArtist){
                retList.push(list[a]);
              }
            }
          }
        } else {
          retList.push(list[a]);
        }
      }
      return retList;
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
            this.albumsValues[this.albumsValues.indexOf(data)][6] = 0;
          } else if(response.data.message == 10){
            this.albumsValues[this.albumsValues.indexOf(data)][6] = 1;
          } else if(response.data.message == -11){
            this.albumsValues[this.albumsValues.indexOf(data)][7] = 0;
            this.albumsValues.splice(this.albumsValues.indexOf(data),1);
            this.rate = 0;
          } else if(response.data.message == 11){
            this.albumsValues[this.albumsValues.indexOf(data)][7] = 1;
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
  }
};
</script>
<style scoped>
@import '../assets/styles/list-style.css';
</style>