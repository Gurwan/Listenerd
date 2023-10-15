<template>
  <div>
    <main-navbar></main-navbar>
    <div class="main-div-auth">
      <div class="bg-white p-8 rounded">
        <h2 class="text-2xl font-semibold mb-4">Register</h2>
        <form @submit.prevent="register">
          <div class="mb-4">
            <input type="text" id="username" placeholder="Username" v-model="username" class="form-input">
          </div>
          <div class="mb-4">
            <input type="password" id="password" placeholder="Password" v-model="password" class="form-input">
          </div>
          <div class="mt-6">
            <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue focus:border-blue-300">
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
    };
  },
  methods: {
    async register() {
      await axios.post('http://localhost:3001/register', {
        username: this.username,
        password: this.password,
      });

      router.push('/login');
    },
  },
};
</script>
  