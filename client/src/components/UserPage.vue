<template>
    <div>
        <main-navbar></main-navbar>
        <div class="picture-profile-div">
            <img :src="pic || require('@/assets/images/empty_pp.jpg')" alt="Profile picture"/>
        </div>
        <div class="info-profile-div">
            <h1>{{ username }}</h1>
            <div v-if="isAuth">
              <a class="text-white hover:text-blue-300 aList" href="#" @click="handleFriendship(username)">
                    <i v-if="friendWith == 0" class="fa-solid fa-user-plus fa-2xl icon-add-album"></i>
                    <i v-else class="fa-solid fa-user-xmark fa-2xl icon-add-album"></i>
              </a>
            </div>
        </div>
        <div class="super-div-list">
            <div class="list-preview" id="list-preview-liked">
              <router-link :to="'/user-liked/' + username">
                <p class="title-list-preview">Liked albums list</p>
              </router-link>
            </div>

            <div class="list-preview" id="list-preview-toListen">
              <router-link :to="'/user-toListen/' + username">
                <p class="title-list-preview">To listen albums list</p>
              </router-link>
            </div>
        </div>
        <div class="super-div-list">
          <div class="list-preview-artist" id="list-preview-artist">
            <router-link :to="'/user-following/' + username">
              <p class="title-list-preview">Followed artists list</p>
            </router-link>
          </div>
        </div>
        <div class="friend-div">
          <p>Friend with</p>
          <div class="list-friends" id="friend-with">

          </div>
        </div>
        <div class="friend-div">
          <p>Friend of</p>
          <div class="list-friends" id="friend-of">
            
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
      friendWith: 0,
      isAuth: false,
      usernameConnected: null
    };
  },
  created() {
    const username = this.$route.params.username;
    const isAuthToken = this.$cookies.get('jwt_token');
    if(isAuthToken){
      this.friendWithLogUser(username);
      this.isAuth = true;
    } else {
      this.isAuth = false;
    }
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
          
        }
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
      })
      .catch(error => {
        console.log(error)
      });
      const userId = this.$cookies.get('jwt_token');
      if(userId != null){
        axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
        axios.get(`http://localhost:3001/username`)
          .then((response) => {
            this.usernameConnected = response.data.message;
            this.findFriends(username);
          })
          .catch(error => {
            console.error('API request error :', error);
          });
      } else {
        this.findFriends(username);
      }

  },
  
  methods: {
    handleFriendship(username){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      const withUserId = username;
      axios.post('http://localhost:3001/friend/', {withUserId})
            .then((response) => {
              if(response.data.message == 0){
                this.friendWith = 0;
              } else if(response.data.message == 1){
                this.friendWith = 1;
              } 
            })
            .catch(error => {
                console.error('API request error :', error);
          });
    },
    findFriends(username){
      const usernameConnected = this.usernameConnected;
      axios.get(`http://localhost:3001/friends-user?user=${username}`)
        .then(response => {
          const friendsWithList = response.data.message[0];
          var friendWith = document.getElementById("friend-with");
          var ul = document.createElement("ul");
          friendsWithList.forEach(function(user) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.textContent = user[0];
            if(user[0] == usernameConnected){
              a.href = '/profile/'
            } else {
              a.href = '/user/' + user[0]
            }
            var img = document.createElement("img");
            if(user[1] != null){
              let byteCharacters = atob(user[1].data);
              let byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              let byteArray = new Uint8Array(byteNumbers);
              let blob = new Blob([byteArray], { type: user[1].contentType });
              img.src = URL.createObjectURL(blob);
            } else {
              img.src = require('@/assets/images/empty_pp.jpg');
            }
            img.classList.add("img-user-preview")
            a.appendChild(img)
            a.classList.add("a-user-preview")
            li.appendChild(a)
            ul.appendChild(li);
          });
          friendWith.appendChild(ul);

          const friendsOfList = response.data.message[1];
          var friendOf = document.getElementById("friend-of");
          var ulOf = document.createElement("ul");
          friendsOfList.forEach(function(user) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.textContent = user[0];
            if(user[0] == usernameConnected){
              a.href = '/profile/'
            } else {
              console.log(usernameConnected)
              a.href = '/user/' + user[0]
            }
            var img = document.createElement("img");
            if(user[1] != null){
              let byteCharacters = atob(user[1].data);
              let byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              let byteArray = new Uint8Array(byteNumbers);
              let blob = new Blob([byteArray], { type: user[1].contentType });
              img.src = URL.createObjectURL(blob);
            } else {
              img.src = require('@/assets/images/empty_pp.jpg');
            }
            img.classList.add("img-user-preview")
            a.appendChild(img)
            a.classList.add("a-user-preview")
            li.appendChild(a)
            ulOf.appendChild(li);
          });
          friendOf.appendChild(ulOf);
        })
       .catch(error => {
         console.error('API error:', error);
       });


    },
    friendWithLogUser(username){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      const withUserId = username;
      axios.get(`http://localhost:3001/friend?withUser=${withUserId}`)
            .then((response) => {
              if(response.data.message == 0){
                this.friendWith = 0;
              } else if(response.data.message == 1){
                this.friendWith = 1;
              } 
            })
            .catch(error => {
                console.error('API request error :', error);
          });
    },
  },
};
</script>
<style scoped>
@import '../assets/styles/profile-style.css';
</style>