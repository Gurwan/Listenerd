function getToken() {
  let value = "; " + document.cookie;
  let parts = value.split('; jwt_token=');
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
}

export default function (to, from, next) {
    if (getToken()) {
      next();
    } else {
      next('/login');
    }
}
  