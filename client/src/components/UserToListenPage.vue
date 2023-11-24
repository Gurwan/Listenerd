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
        </div>
      </div>
      <div class="grid-list">
        <div v-for="data in sortAndFilterAlbumsList" :key="data[0]" class="p-4 flex flex-col items-center">
          <router-link  :to="'/album/' + data[0]">
            <img :src="data[3]" alt="Image" class="max-w-full h-auto w-64 md:w-48 lg:w-32 xl:w-24 mb-2 mx-auto"> 
            <p class="font-bold">{{ data[1] }}</p>
            <p class="text-gray-600">{{ data[2][1] }} - {{ data[4] }}</p>
          </router-link> 
      </div>
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
    filterYear: null,
    filterArtist: null
  };
},
created(){
  const username = this.$route.params.username;
  axios.get(`http://localhost:3001/user-list?list=0&user=${username}`)
    .then(response => {
      const allData = response.data;
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
      console.log(error)
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
  }
};
</script>
<style scoped>
@import '../assets/styles/list-style.css';
</style>
  