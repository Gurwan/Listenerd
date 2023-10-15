export default function (to, from, next) {
    if (localStorage.getItem('jwt_token')) {
      next();
    } else {
      next('/login');
    }
}
  