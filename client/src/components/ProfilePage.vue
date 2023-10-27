<template>
    <div>
        <main-navbar></main-navbar>
        <div class="picture-profile-div">
            <img :src="pic || require('@/assets/images/empty_pp.jpg')" alt="Profile picture"/>
            <input type="file" ref="fileInput" @change="changePic" style="display: none" />
        </div>
        <div class="info-profile-div">
            <h1>{{ username }}</h1>
        </div>
        <div>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded" @click="chooseNewPic">Load a new picture</button>
          <button id="saveNewPicId" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded" style="display: none;" @click="savePic">Save the new profile picture</button>
        </div>
        <div>
          <div v-if="successSave" class="success">{{ successSave }}</div>
        </div>
        <div class="super-div-list">
            <div class="list-preview" id="list-preview-liked">
              <router-link :to="'/liked/'">
                <p class="title-list-preview">Liked albums list</p>
              </router-link>
            </div>

            <div class="list-preview" id="list-preview-toListen">
              <router-link :to="'/toListen/'">
                <p class="title-list-preview">To listen albums list</p>
              </router-link>
            </div>
        </div>
        <div class="super-div-list">
          <div class="list-preview-artist" id="list-preview-artist">
            <router-link :to="'/following/'">
              <p class="title-list-preview">Followed artists list</p>
            </router-link>
          </div>
        </div>
        <div class="change-super-div">
          <div class="change-div">
            <label for="countrySelect" class="block text-gray-700 text-sm font-bold mb-2">You can change you country here </label>
            <select id="countrySelect" v-model="country" @change="changeCountry" class="block w-full bg-white border border-gray-300 p-2 rounded">
              <option value="IE">Ireland</option>
              <option value="FR">France</option>
              <option value="US">USA</option>
            </select>
          </div>
        </div>
        <div class="change-super-div">
          <div class="change-div">
            <label for="scaleSelect" class="block text-gray-700 text-sm font-bold mb-2">You can change the scale of your rates here </label>
            <select id="scaleSelect" v-model="params.scale" @change="changeScale" class="block w-full bg-white border border-gray-300 p-2 rounded">
              <option value="/ 20">/ 20</option>
              <option value="/ 10">/ 10</option>
              <option value="/ 5">/ 5</option>
              <option value="empty">Empty</option>
            </select>
          </div>
        </div>

        <div>
          <h3 class="block text-gray-700 text-sm font-bold mb-2">Change the colors and the ranges</h3>
          <div>
              <div v-for="(item, i) in params.gap" :key="i" class="change-div-range">
                <div class="param-gap-div">
                  <label>Low limit</label>
                  <input type="number" v-model="item[0]" class="w-20" />
                </div>
                <div class="param-gap-div">
                  <label>Upper limit</label>
                  <input type="number" v-model="item[1]" class="w-20" />
                </div>
                <div class="param-gap-div">
                  <label>Color</label>
                  <input type="text" v-model="item[2]" class="w-32" />
                </div>
              </div>
          </div>

          <button @click="saveRange" class="bg-blue-500 text-white px-4 py-2 rounded">Save the range</button>
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
      username: "",
      pic: null,
      successSave: null,
      filePic: null,
      country: "IE",
      params: {
        scale: null,
        gap: []
      }
    };
  },
  created() {
    const userId = localStorage.getItem('jwt_token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;

    axios.get('http://localhost:3001/user')
      .then(async response => {
        const user = response.data.user;
        const previewCovers = response.data.preview;
        this.params = response.data.params;
        this.username = user.username;
        this.country = user.country;
        if(user.profilePicture != null){
          //convert base64 to file
          //code providing from several topics on stackoverflow I guess
          const byteCharacters = atob(user.profilePicture.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: user.profilePicture.contentType });
          this.pic = URL.createObjectURL(blob);
          if(previewCovers[0].length == 3){
            let element = document.getElementById("list-preview-toListen");
            element.style.backgroundImage = `url(${previewCovers[0][0]}), url(${previewCovers[0][1]}), url(${previewCovers[0][2]})`;
          }

          if(previewCovers[1].length == 3){
            let element = document.getElementById("list-preview-liked");
            element.style.backgroundImage = `url(${previewCovers[1][0]}), url(${previewCovers[1][1]}), url(${previewCovers[1][2]})`;
          }

          if(previewCovers[2].length == 3){
            let element = document.getElementById("list-preview-artist");
            element.style.backgroundImage = `url(${previewCovers[2][0]}), url(${previewCovers[2][1]}), url(${previewCovers[2][2]})`;
          }
        }
      })
      .catch(error => {
        if(error != null){
          this.$router.push('/logout') 
          console.log(error)
        }
      });
  },
  
  methods: {
    saveRange(){
      const userId = localStorage.getItem('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      const dataToSend = this.params.gap;
      axios.put('http://localhost:3001/gap', {dataToSend})
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          if(error != null){
            this.$router.push('/logout') 
          }        
        }
      );
    },
    chooseNewPic(){
      this.$refs.fileInput.click();
      document.getElementById("saveNewPicId").style.display = "inline";
    },
    changePic(event) {
      const file = event.target.files[0];
      if (file) {
        this.pic = URL.createObjectURL(file);
        this.filePic = file;
      }
    },
    changeCountry(){
      const userId = localStorage.getItem('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      const dataToSend = this.country;
      axios.put('http://localhost:3001/country', {dataToSend})
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          if(error != null){
            this.$router.push('/logout') 
          }        
        }
      );
    },
    changeScale(){
      const userId = localStorage.getItem('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      console.log(this.params.scale)
      const dataToSend = this.params.scale;
      axios.put('http://localhost:3001/scale', {dataToSend})
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          if(error != null){
            this.$router.push('/logout') 
            console.log("error")
          }        
        }
      );
    },
    savePic(){
      const userId = localStorage.getItem('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      if(this.filePic){
        const formDataPicture = new FormData();
        formDataPicture.append('profilePicture', this.filePic);
        const type = formDataPicture.get('profilePicture').type
        const reader = new FileReader();
        reader.onload = function () {
          const fileBase64 = reader.result.split(',')[1];
          axios.put('http://localhost:3001/user-picture', {fileBase64,type})
          .then(response => {
            if(response.status == 200){
              console.log("profile picture edited")
            }
          })
          .catch(error => {
            if(error != null){
              console.log(error)
            }
          });
        };
        reader.readAsDataURL(this.filePic);
        this.successSave = 'Profile picture updated';
        document.getElementById("saveNewPicId").style.display = "none";
        setTimeout(() => {
          this.successSave = null;
        }, 4000);

      }
    }
  },
};
</script>
<style scoped>
@import '../assets/styles/profile-style.css';
</style>
  