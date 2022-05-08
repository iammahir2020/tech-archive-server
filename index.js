const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function verifyJwtToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const jwtAccessToken = authHeader.split(" ")[1];
  // // console.log(jwtAccessToken);
  jwt.verify(jwtAccessToken, process.env.JWT_ACCESSTOKEN, (error, decoded) => {
    if (error) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    // console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

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
    const reviewsCollection = client.db("techArchive").collection("reviews");

    app.post("/getJWTtoken", async (req, res) => {
      const user = req.body;
      const jwtAccessToken = jwt.sign(user, process.env.JWT_ACCESSTOKEN, {
        expiresIn: "1d",
      });
      res.send({ jwtAccessToken });
    });

    app.get("/items", async (req, res) => {
      const numberOfItem = parseInt(req.query.number);
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

    app.put("/item", async (req, res) => {
      const { newQuantity, id } = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          quantity: newQuantity,
        },
      };
      const result = await itemsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/item", verifyJwtToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      // console.log("test", decodedEmail);
      // return;
      const userEmail = req.query.email;
      if (userEmail === decodedEmail) {
        const query = { creater: userEmail };
        const cursor = itemsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });
    app.get("/inventory", async (req, res) => {
      const itemID = req.query.id;
      const query = { _id: ObjectId(itemID) };
      const result = await itemsCollection.findOne(query);
      res.send(result);
    });
    app.delete("/item", async (req, res) => {
      const itemId = req.query.id;
      const query = { _id: ObjectId(itemId) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
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
