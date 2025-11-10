const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kcv09gc.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("server is running in root");
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const db = client.db("assignment-ten");
    const billsCollection = db.collection("bills");
    const usersCollection = db.collection("users");
    const myBillsCollection = db.collection("myBills");
    //users api
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({
          message: "user already exist. do not need to insert again",
        });
      } else {
        const result = await usersCollection.insertOne(newUser);
      }
    });

    //bills api
    // app.get("/bills", async (req, res) => {
    //   const email = req.query.email;
    //   const query = {};
    //   if (email) {
    //     query.email = email;
    //   }
    //   const cursor = billsCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });
    // ... (inside run() function, replace your existing app.get("/bills", ...) with this)

    app.get("/bills", async (req, res) => {
      const email = req.query.email;
      const category = req.query.category;
      let query = {};

      if (email) {
        query.email = email;
      }

      if (category && category !== "All Categories") {
        query.category = category;
      }

      try {
        const cursor = billsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching or filtering bills:", error);
        res.status(500).send({ message: "Failed to fetch bills" });
      }
    });

    app.get("/recent", async (req, res) => {
      const cursor = billsCollection.find().sort({ date: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/bills/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await billsCollection.findOne(query);
      res.send(result);
    });

    app.post("/myBills", async (req, res) => {
      const newBill = req.body;
      const result = await myBillsCollection.insertOne(newBill);
      res.send(result);
    });
    // app.get("/myBills", async (req, res) => {
    //   const query = {};
    //   if (query.email) {
    //     query.email = email;
    //   }
    //   const cursor = myBillsCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.get("/myBills", async (req, res) => {
      const userEmail = req.query.email;
      const query = {};
      if (userEmail) {
        query.email = userEmail;
      }
      const cursor = myBillsCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });

    app.delete("/myBills/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myBillsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// assignment-ten
// THgOqwrkCaBYyZEY
