<template>
  <div>
    <main-navbar></main-navbar>
    <div class="main-div-auth">
      <div class="bg-white p-8 rounded">
        <h2 class="text-2xl font-semibold mb-4">Login</h2>
        <form @submit.prevent="login">
          <div class="mb-4">
            <input type="text" placeholder="Username" id="username" v-model="username" class="form-input" @keyup.enter="login">
          </div>
          <div class="mb-4">
            <input type="password" placeholder="Password" id="password" v-model="password" class="form-input" @keyup.enter="login">
          </div>
          <div class="mt-6">
            <button type="submit" class="big-button bg-blue-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue focus:border-blue-300">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
    <FlashAlert :flashMessage="errorMsg" />
  </div>
</template>

<script>
import axios from 'axios';
import router from '../router.js'; 
import MainNavbar from './MainNavbar.vue'
import FlashAlert from './FlashAlert.vue'
export default {
  components: {
    "main-navbar": MainNavbar,
    FlashAlert
  },
  data() {
    return {
      username: '',
      password: '',
      errorMsg: null
    };
  },
  methods: {
    async login() {
      await axios.post('http://localhost:3001/login', {
        username: this.username,
        password: this.password,
      }).then(response => {
        const token = response.data.token;
        //set security to true, the path to the all website, and the None sameSite field.
        this.$cookies.set('jwt_token',token,"2h",'/',null,true,"None");
        router.push('/');
      })
      .catch(error => {
          this.errorMsg = error.response.data.msg
      });
    },
  },
};
</script>