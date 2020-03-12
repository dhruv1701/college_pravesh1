require("./config/config");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const cors = require("cors");
// const helmet = require('helmet');
const cookieSession = require("cookie-session");

var { Ranking } = require("./models/ranking");


const publicPath = path.join(__dirname, "../public");
const PORT = process.env.PORT || 3000;

var adminRouter = require("./routes/adminRouter")();
var counsellorRouter = require("./routes/counsellorRouter")();
var studentRouter = require("./routes/studentRouter")();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });

var app = express();
var server = http.createServer(app);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(publicPath));
//app.use(helmet());
app.set("views", path.join(__dirname, "../views"));
app.use(
  cookieSession({
    name: "session",
    secret: process.env.COOKIE_SECRET,
    maxAge: 2 * 60 * 60 * 1000 // 2 hours
  })
);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/admin",adminRouter);
app.use("/student",studentRouter);
app.use("/counsellor",counsellorRouter);

app.get("/", async (req, res) => {
  const docs = await Ranking.getAll();
  res.render("index", { docs });
});

app.get("/signup",async (req,res) => {
    res.render("signup");
})

app.get("/forum",async(req,res) =>{
  res.render("forum")
})

app.post("/forum-data",async(req,res) => {
  
})
// default error page
app.use((req, res) => {
  res.status(404).render("error", {
    errorTitle: "Not Found",
    errorMsg: "Sorry, we couldn't find that"
  });
});

server.listen(PORT, () => {
  console.log(`server is up on port ${PORT}`);
});
