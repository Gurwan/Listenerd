const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('root');
});

app.listen(port, () => {
  console.log(`Server express is running on the port ${port}`);
});