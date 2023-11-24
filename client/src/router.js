import { createRouter, createWebHistory } from 'vue-router';
import MainPage from './components/MainPage.vue';
import AlbumPage from './components/AlbumPage.vue';
import ArtistPage from './components/ArtistPage.vue';
import LoginPage from './components/LoginPage.vue';
import RegisterPage from './components/RegisterPage.vue';
import ProfilePage from './components/ProfilePage.vue';
import FollowingPage from './components/FollowingPage.vue';
import LogoutPage from './components/LogoutPage.vue';
import LikedPage from './components/LikedPage.vue';
import ToListenPage from './components/ToListenPage.vue';
import UserPage from './components/UserPage.vue';
import UserLikedPage from './components/UserLikedPage.vue';
import UserToListenPage from './components/UserToListenPage.vue';
import UserFollowingPage from './components/UserFollowingPage.vue';
import authCheck from './authCheck.js'; 

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
      {
        path: '/register',
        name: 'Register page',
        component: RegisterPage,
      },
      {
        path: '/login',
        name: 'Login page',
        component: LoginPage,
      },
      {
        path: '/user/:username',
        name: 'User',
        component: UserPage,
      },
      {
        path: '/profile',
        name: 'Profile',
        component: ProfilePage,
        beforeEnter: authCheck,
      },
      {
        path: '/liked',
        name: 'Liked albums',
        component: LikedPage,
        beforeEnter: authCheck,
      },
      {
        path: '/user-liked/:username',
        name: 'Liked albums user',
        component: UserLikedPage,
      },
      {
        path: '/toListen',
        name: 'Albums to listen',
        component: ToListenPage,
        beforeEnter: authCheck,
      },
      {
        path: '/user-toListen/:username',
        name: 'To listen albums user',
        component: UserToListenPage,
      },
      {
        path: '/following',
        name: 'Followed artists',
        component: FollowingPage,
        beforeEnter: authCheck,
      },
      {
        path: '/user-following/:username',
        name: 'Followed artists user',
        component: UserFollowingPage,
      },
      {
        path: '/logout',
        name: 'Logout page',
        component: LogoutPage,
      },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
