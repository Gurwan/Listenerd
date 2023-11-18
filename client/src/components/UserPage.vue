<template>
    <div>
        <main-navbar></main-navbar>
        <div class="picture-profile-div">
            <img :src="pic || require('@/assets/images/empty_pp.jpg')" alt="Profile picture"/>
        </div>
        <div class="info-profile-div">
            <h1>{{ username }}</h1>
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
    };
  },
  created() {
    const username = this.$route.params.username;

    axios.get(`http://localhost:3001/user-public/?username=${username}`)
      .then(async response => {
        const user = response.data.user;
        const previewCovers = response.data.preview;
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
        console.log(error)
      });
  },
  
  methods: {
  },
};
</script>
<style scoped>
@import '../assets/styles/profile-style.css';
</style>