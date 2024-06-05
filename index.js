const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 5000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://nazmulcpi2012:tvWGdsGz3pKD6TBS@cluster0.uwc0q6d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// const uri = "mongodb+srv://nazmulcpi2012:<password>@cluster0.uwc0q6d.mongodb.net/?

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
    const fruitsCollection = organicFruitsDB.collection("fruitsCollection");

    // fruits routes
    app.post("/fruits", async (req, res) => {
      const fruitsData = req.body;
      const result = await fruitsCollection.insertOne(fruitsData);
      res.send(result);
      console.log(result);
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

    app.patch("/fruits/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await fruitsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send(result);
    });

    app.delete("/fruits/:id", async (req, res) => {
      const id = req.params.id;
      const result = await fruitsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    console.log("You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// tvWGdsGz3pKD6TBS
// nazmulcpi2012
