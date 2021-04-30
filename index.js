const http = require("http");
const path = require("path");
const serverless = require("serverless-http");
const express = require("express");
const gs = require("good-status");
const db = require("./models");
const messageCrtl = require("./controllers/message");
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const router = express.Router();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(gs({ send: false }));

app.use("/.netlify/functions/index", router);

// code goes here

router.get("/message/:msgHash", messageCrtl.getMsg);

//API

// get message
router.get("/api/message/:msgHash", messageCrtl.getMsg);

// create message
router.post("/api/message", messageCrtl.create);

// verify message
router.post("/api/message/:msgHash/verify", messageCrtl.verify);

// code goes here

// db.sequelize.sync({ force: !true }).then(() => {
server.listen(PORT, () => console.log(`server is running at ${PORT}`));
// });

module.exports.handler = serverless(app);
