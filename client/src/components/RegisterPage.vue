<template>
  <div>
    <main-navbar></main-navbar>
    <div class="main-div-auth">
      <div class="bg-white p-8 rounded">
        <h2 class="text-2xl font-semibold mb-4">Register</h2>
        <form @submit.prevent="register">
          <div>
            <span style="color: red;" v-if="username.length < 4">The username must contain at least 4 characters</span>
          </div>
          <div class="mb-4">
            <input type="text" id="username" placeholder="Username" v-model="username" class="form-input">
          </div>
          <div>
            <span style="color: red;" v-if="password.length < 8">The password must contain at least 8 characters</span>
          </div>
          <div class="mb-4">
            <input type="password" id="password" placeholder="Password" v-model="password" class="form-input">
          </div>
          <div>
            <span style="color: red;" v-if="password !== repeat_password">Both passwords must be identical</span>
          </div>
          <div class="mb-4">
            <input type="password" id="repeat_password" placeholder="Confirm your password" v-model="repeat_password" class="form-input">
          </div>
          <div class="mt-6">
            <button type="submit" class="big-button bg-blue-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue focus:border-blue-300">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

</template>
  
<script>
import axios from 'axios';
import router from '../router.js'; 
import MainNavbar from './MainNavbar.vue'
export default {
  components: {
    "main-navbar": MainNavbar
  },
  data() {
    return {
      username: '',
      password: '',
      repeat_password: ''
    };
  },
  methods: {
    async register() {
      if(this.username.length >= 4){
        if(this.password == this.repeat_password){
          if(this.password.length >= 8){
            await axios.post('http://localhost:3001/user', {
              username: this.username,
              password: this.password,
            });
            router.push('/login');
          } else {
            alert('The password must contain at least 8 characters');
          }
        } else {
          alert('Both passwords must be identical');
        }
      } else {
          alert('The username must contain at least 4 characters');
      }
    },
  },
};
</script>
  