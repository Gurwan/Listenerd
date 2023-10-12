<template>
        <div class="main-div-artist">
          <div class="artist-side-div">
            <sync-loader v-if="!artistData.length" :loading="loading" :color="color" :size="size"></sync-loader>

            <div v-else>
              <div class="artist-details-div">
                <img :src="artistData[2]" alt="Artist picture" class="artist_picture">
                <h1 class="text-2xl font-bold">{{ artistData[1] }}</h1> 
                <p class="text-lg">{{ artistData[3] }}</p> 
                <div class="items-center justify-center" id="spotifyPlayerDiv"></div>
              </div>
              <div class="albums-grid" id="grid-albums">
              </div>
            </div>
          </div>
    </div>
</template>  
  
<script>
import axios from 'axios';
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'

export default {
  data() {
    return {
      artistData: [],
    };
  },
  created() {
    const artistId = this.$route.params.id;
    this.getArtistData(artistId); 
  },
  methods: {
    getArtistData(artistId) {
      axios.get(`http://localhost:3001/discogs-artist?artistId=${artistId}`)
        .then(response => {
          this.artistData = response.data;
          this.getAccessTokenSpotify();
        })
        .catch(error => {
          console.error('API error:', error);
        });
    },
    getAccessTokenSpotify(){
      axios.get(`http://localhost:3001/get-spotify-access-token`)
        .then(response => {
          this.loadSpotifyPlayer(response.data);
        })
        .catch(error => {
          console.error('API error:', error);
        });
    },
    loadSpotifyPlayer(accessTokenSpotify) {
      const artistName = this.artistData[1];
      axios.get(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`, {
          headers: {
            Authorization: `Bearer ${accessTokenSpotify}`,
          },
        })
        .then((response) => {          
          const artistId = response.data.artists.items[0].id;
          //we need to provide a country so I put France to test
          axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=FR`, {
            headers: {
              Authorization: `Bearer ${accessTokenSpotify}`,
            },
          })
          .then((response) => {
            const topTracks = response.data.tracks;
            this.getRandomTrack(topTracks,accessTokenSpotify);
          })
          .catch((error) => {
            console.error('Spotify API error', error);
          });
          
          this.loadAllAlbumsOfArtist(artistId,accessTokenSpotify);
 
        })
        .catch((error) => {
          console.error('Spotify API error', error);
        });
    },
    getRandomTrack(topTracks) {
      const randomTrack = topTracks[Math.floor(Math.random() * topTracks.length)];
      const spotifyDiv = document.getElementById('spotifyPlayerDiv');
      const iframe = document.createElement('iframe');
      iframe.src = `https://open.spotify.com/embed/track/${randomTrack.id}`;
      iframe.classList = "w-96 h-48"
      spotifyDiv.appendChild(iframe);
    },
    loadAllAlbumsOfArtist(artistId,accessTokenSpotify){
      axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
               headers: {
                Authorization: `Bearer ${accessTokenSpotify}`,
              },
            })
            .then((response) => {
              console.log(response.data)
              const albums = response.data.items;
              const gridAlbums = document.getElementById('grid-albums');

              albums.forEach(album => {
                if(album.album_type != 'single'){
                  const albumElement = document.createElement('div');
                  albumElement.classList.add('p-4', 'flex', 'flex-col', 'items-center');

                  const cover = document.createElement('img');
                  cover.setAttribute('src', album.images[0].url);
                  cover.setAttribute('alt', 'Image');
                  cover.classList.add('max-w-full', 'h-auto', 'w-64', 'md:w-48', 'lg:w-32', 'xl:w-24', 'mb-2', 'mx-auto');

                  const title = document.createElement('p');
                  title.classList.add('font-bold');
                  title.textContent = album.name;

                  const year = document.createElement('p');
                  year.classList.add('text-gray-600');
                  year.textContent = `${this.artistData[1]} - ${album.release_date}`;

                  albumElement.appendChild(cover);
                  albumElement.appendChild(title);
                  albumElement.appendChild(year);

                  gridAlbums.appendChild(albumElement);
                }
              });
            })
            .catch((error) => {
              console.error('Spotify API error', error);
            });
    }
  },
  components: {
    SyncLoader, 
  },
};
</script>

<style scoped>
@import '../assets/styles/artist-style.css';
</style>
