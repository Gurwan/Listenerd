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
    };
  },
  created() {
    const userId = localStorage.getItem('jwt_token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;

    axios.get('http://localhost:3001/user-profile')
      .then(async response => {
        const user = response.data.user;
        const previewCovers = response.data.previewAlbums;
        this.username = user.username;
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
          console.log(previewCovers)
          if(previewCovers[0].length == 3){
            let element = document.getElementById("list-preview-toListen");
            element.style.backgroundImage = `url(${previewCovers[0][0]}), url(${previewCovers[0][1]}), url(${previewCovers[0][2]})`;
          }

          if(previewCovers[1].length == 3){
            let element = document.getElementById("list-preview-liked");
            element.style.backgroundImage = `url(${previewCovers[1][0]}), url(${previewCovers[1][1]}), url(${previewCovers[1][2]})`;

          }
        }
      })
      .catch(error => {
        console.error(error);
      });
  },
  
  methods: {
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
          axios.post('http://localhost:3001/user-save-profile-picture', {fileBase64,type})
          .then(response => {
            if(response.status == 200){
              console.log("profile picture edited")
            }
          })
          .catch(error => {
            console.error(error);
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
  