import { createRouter, createWebHistory } from 'vue-router';
import MainPage from './components/MainPage.vue';
import AlbumPage from './components/AlbumPage.vue';

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
