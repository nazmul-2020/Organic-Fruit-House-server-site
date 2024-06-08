require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 5000;
// const port = process.env.PORT;

app.use(cors());
app.use(express.json());

function createToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
    },
    "secret",
    { expiresIn: "7d" }
  );
  return token;
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "secret");
  console.log(verify)
  if (!verify?.email) {
    return res.send("You are not authorized");
  }
  req.user = verify.email;
  next();
}

const uri = process.env.DATABASE_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const organicFruitsDB = client.db("organicFruitsDB");
    const userDB = client.db("userDB");
    const fruitsCollection = organicFruitsDB.collection("fruitsCollection");
    const userCollection = userDB.collection("userCollection");

    // fruits routes
    app.post("/fruits",verifyToken, async (req, res) => {
      const fruitsData = req.body;
      const result = await fruitsCollection.insertOne(fruitsData);
      res.send(result);
      // console.log(result);
    });

    app.get("/fruits", async (req, res) => {
      const fruitsData = fruitsCollection.find();
      const result = await fruitsData.toArray();
      res.send(result);
      console.log(result);
    });

    app.get("/fruits/:id", async (req, res) => {
      const id = req.params.id;
      const fruitsData = await fruitsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(fruitsData);
      console.log(fruitsData);
    });

    app.patch("/fruits/:id",verifyToken, async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await fruitsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send(result);
    });

    app.delete("/fruits/:id",verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await fruitsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // user routes
    app.post("/user", async (req, res) => {
      const user = req.body;
      const token = createToken(user);
      console.log(token);
      const isUserExist = await userCollection.findOne({ email: user?.email });
      if (isUserExist?._id) {
        return res.send({
          status: "success",
          message: "Login success",
          token,
        });
      }
      const result = await userCollection.insertOne(user);
      return res.send({ token });
    });

    app.get("/user/get/:id", async (req, res) => {
      const id = req.params.id;
      const result = await userCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    app.patch("/user/:email", async (req, res) => {
      const email = req.params.email;
      const userData = req.body;
      const result = await userCollection.updateOne(
        { email },
        { $set: userData },
        { upsert: true }
      );
      res.send(result);
    });

    console.log("You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("WelCome To Our OrgOrganic Fruits Shop");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
