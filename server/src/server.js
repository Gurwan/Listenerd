const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = 3001;

//I could use a environment variable to store the password with the npm module dotenv but it's testing so no needs.
const uri = "mongodb+srv://listenerd_test:wKSMDtg283ojJncG@cluster0.zcloy3n.mongodb.net/?retryWrites=true&w=majority";

//The code between line 10 and 31 is provided by the website cloud.mongodb.com to implement MongoDB Atlas and have an online database
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('root');
});

app.listen(port, () => {
  console.log(`Server express is running on the port ${port}`);
});