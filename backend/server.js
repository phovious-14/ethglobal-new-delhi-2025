import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/conn.js";
import router from "./routes/index.js";

const app = express();
const port = process.env.PORT || 4000;

// Load environment variables
dotenv.config();

//create a mongoDB connection
connectDB();

app.use(express.urlencoded({ limit: "50mb", extended: true })); //set urlencoded to true
app.use(express.json()); //set json to true
app.use(cookieParser()); //set cookie parser
app.use(cors({ origin: true, credentials: true }));

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL );

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Accept, multipart/form-data"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.use("/api", router);

app.use("/*", (req, res) => {
  res.send("<h1>404 page not found</h1>");
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
