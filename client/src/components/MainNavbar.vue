<template>
  <nav class="bg-blue-500 p-4">
    <div class="container mx-auto flex items-center justify-between">
      <a class="text-white text-lg font-semibold" href="#">Home</a>
      <ul class="flex space-x-4">
        <li class="nav-item">
          <a class="text-white hover:text-blue-300" href="#">Search</a>
        </li>
        <li class="nav-item">
          <a class="text-white hover:text-blue-300" href="#">Login</a>
        </li>
        <li class="nav-item">
          <a class="text-white hover:text-blue-300" href="#">Register</a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'MainNavbar'
};
</script>