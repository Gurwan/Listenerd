<template>
  <nav class="bg-indigo-500 p-4">
    <div class="container mx-auto flex items-center justify-between">
      <a class="text-white text-lg font-semibold" href="/">Home</a>
      <ul class="flex space-x-4">
        <div v-if="search_active">
          <input
            v-model="searchText"
            @keyup.enter="searchAlbumsArtists"
            class="px-3 border rounded-lg"
            placeholder="Search something"
          />
        </div>
        <li class="nav-item">
          <a class="text-white hover:text-blue-300" href="#" @click="activateSearch">
            <i class="fas fa-search"></i>
          </a>
        </li>
        <li class="nav-item">
          <a class="text-white hover:text-blue-300" href="/login">Login</a>
        </li>
        <li class="nav-item">
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
    };
  },
  methods: {
    activateSearch() {
      this.search_active = !this.search_active;
    },
    searchAlbumsArtists() {
      this.$emit('search-text-changed', this.searchText);
      this.search_active = false;
    }
  },

};
</script>