const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.s0z2b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const itemsCollection = client.db("techArchive").collection("items");

    app.get("/items", async (req, res) => {
      const numberOfItem = parseInt(req.query.number);
      console.log(numberOfItem);
      let cursor;
      const query = {};
      if (numberOfItem) {
        cursor = itemsCollection.find(query).limit(numberOfItem);
      } else {
        cursor = itemsCollection.find(query);
      }
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/item", async (req, res) => {
      const item = req.body;
      const result = await itemsCollection.insertOne(item);
      res.send(result);
    });

    app.get("/item", async (req, res) => {
      const userEmail = req.query.email;
      const query = { creater: userEmail };
      const cursor = itemsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.delete("/item", async (req, res) => {
      const itemId = req.query.id;
      const query = { _id: ObjectId(itemId) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Assignment 11 BackEnd Server is LIVE!");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});
