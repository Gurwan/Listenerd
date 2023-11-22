<template>
  <nav class="bg-indigo-500 p-4">
    <div class="container mx-auto flex items-center justify-between">
      <a class="text-white text-lg font-semibold" href="/">Home</a>
      <div class="navbar-mobile">
        <button @click="openMobileMenu" class="text-white hover:text-blue-300">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      <ul class="ul-nav space-x-4">
        <div v-if="search_active" id="searchAndCate">
          <select v-model="searchField" @change="changeFieldSearch" id="selectSearchCate" class="bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option value="album">Albums</option>
            <option value="artist">Artists</option>
            <option value="user">Users</option>
          </select>
          <div id="searchAndInstantResult">
            <input
            v-model="searchText"
            @keyup.enter="searchAlbumsArtists"
            class="px-3 border rounded-lg"
            placeholder="Search something"
            @input="instantSearch"
            />
            <ul id="ulInstantResult" class="ulInstantResult">
            </ul>
          </div>

        </div>
        <li class="nav-item" v-if="onMainPage">
          <a class="text-white hover:text-blue-300" href="#" @click="activateSearch">
            <i class="fas fa-search"></i>
          </a>
        </li>
        <li class="nav-item" v-if="isAuth">
          <a class="text-white hover:text-blue-300" href="/profile">Profile</a>
        </li>
        <li class="nav-item" v-if="isAuth">
          <a class="text-white hover:text-blue-300" href="/liked">Liked</a>
        </li>
        <li class="nav-item" v-if="isAuth">
          <a class="text-white hover:text-blue-300" href="/toListen">To listen</a>
        </li>
        <li class="nav-item" v-if="isAuth">
          <a class="text-white hover:text-blue-300" href="/following">Following</a>
        </li>
        <li class="nav-item" v-else>
          <a class="text-white hover:text-blue-300" href="/login">Login</a>
        </li>
        <li class="nav-item" v-if="isAuth">
          <a class="text-white hover:text-blue-300" href="/logout">Logout</a>
        </li>
        <li class="nav-item" v-else>
          <a class="text-white hover:text-blue-300" href="/register">Register</a>
        </li>
      </ul>
    </div>
    <div :class="mobileMenu ? 'block' : 'hidden'">
      <ul class="mt-2">
        <div v-if="search_active">
          <select v-model="searchField" @change="changeFieldSearch" id="selectSearchCate" class="bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option value="album">Albums</option>
            <option value="artist">Artists</option>
            <option value="user">Users</option>
          </select>
          <div id="searchAndInstantResult">
            <input
              v-model="searchText"
              @keyup.enter="searchAlbumsArtists"
              class="px-3 border rounded-lg"
              placeholder="Search something"
              @input="instantSearchM"
            />
            <ul class="ulInstantResult" id="ulInstantResultM">
            </ul>
          </div>
        </div>
        <li class="nav-item" v-if="onMainPage">
          <a class="text-white hover:text-blue-300" href="#" @click="activateSearch">
            <i class="fas fa-search"></i>
          </a>
        </li>
        <li class="nav-item" v-if="isAuth">
          <a class="text-white hover:text-blue-300" href="/profile">Profile</a>
        </li>
        <li class="nav-item" v-if="isAuth">
          <a class="text-white hover:text-blue-300" href="/liked">Liked</a>
        </li>
        <li class="nav-item" v-if="isAuth">
          <a class="text-white hover:text-blue-300" href="/toListen">To listen</a>
        </li>
        <li class="nav-item" v-if="isAuth">
          <a class="text-white hover:text-blue-300" href="/following">Following</a>
        </li>
        <li class="nav-item" v-else>
          <a class="text-white hover:text-blue-300" href="/login">Login</a>
        </li>
        <li class="nav-item" v-if="isAuth">
          <a class="text-white hover:text-blue-300" href="/logout">Logout</a>
        </li>
        <li class="nav-item" v-else>
          <a class="text-white hover:text-blue-300" href="/register">Register</a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      name: 'MainNavbar',
      search_active: false,
      searchText: '',
      isAuth: false,
      onMainPage: false,
      mobileMenu: false,
      searchField: 'album',
      instantResult: []
    };
  },
  created() {
    const isAuthToken = this.$cookies.get('jwt_token');
    if(isAuthToken){
      this.isAuth = true;
    } else {
      this.isAuth = false;
    }

    if(window.location.pathname == '/'){
      this.onMainPage = true;
    } else {
      this.onMainPage = false;
    }
  },
  methods: {
    openMobileMenu() {
      this.mobileMenu = !this.mobileMenu;
    },
    activateSearch() {
      this.search_active = !this.search_active;
    },
    searchAlbumsArtists() {
      this.$emit('search-text-changed', this.searchText, this.searchField);
      this.search_active = false;
    },
    changeFieldSearch(e){
      const v = e.target.value;
      this.searchField = v;
    },
    instantSearch(){
      this.$emit('instantText', this.searchText, this.searchField,false);
    },
    instantSearchM(){
      this.$emit('instantText', this.searchText, this.searchField,true);
    },
  },

};
</script>

<style scoped>
@import '../assets/styles/nav-style.css';
</style>
