<template>
    <div>
      <p>Disconnection in progress.</p>
    </div>
</template>
  
<script>
  import router from '../router.js'; 

  export default {
    created() {
      this.$cookies.remove('jwt_token');
      router.push('/');
    },
 };
</script>
  