import { createRouter, createWebHistory } from 'vue-router';
import MainPage from './components/MainPage.vue';
import AlbumPage from './components/AlbumPage.vue';
import ArtistPage from './components/ArtistPage.vue';

const routes = [
    {
        path: '/',
        name: 'Home page',
        component: MainPage,
      },
      {
        path: '/album/:id', 
        name: 'Album page',
        component: AlbumPage,
      },
      {
        path: '/artist/:id', 
        name: 'Artist page',
        component: ArtistPage,
      },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
