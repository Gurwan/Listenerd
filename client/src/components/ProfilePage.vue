<template>
    <div>
        <main-navbar></main-navbar>
        <div class="picture-profile-div">
            <img :src="profilePicture || require('@/assets/images/empty_pp.jpg')" alt="Photo de profil" @click="changePic" />
            <input type="file" ref="inputPicture" style="display: none" @change="saveNewPic" />
        </div>
        <div class="info-profile-div">
            <h1>{{ username }}</h1>
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
      pic: "",
    };
  },
  created() {
    const userId = localStorage.getItem('jwt_token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;

    axios.get('http://localhost:3001/user-profile')
      .then(response => {
        const user = response.data;
        this.username = user.username;
        this.pic = user.profilePicture;
      })
      .catch(error => {
        console.error(error);
      });
  },
  
  methods: {
    changePic() {

    },
    saveNewPic(){

    }
    
  },
};
</script>
<style scoped>
@import '../assets/styles/profile-style.css';
</style>
  