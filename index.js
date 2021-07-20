const http = require("http");
const path = require("path");
const express = require("express");
const gs = require("good-status");
const db = require("./models");
const messageCrtl = require("./controllers/message");
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(gs({ send: false }));

// code goes here

app.get("/message/:msgHash", messageCrtl.getMsg);
app.get("/message/:msgHash/view", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "view-message.html"));
});

//API

// get message
app.get("/api/message/:msgHash", messageCrtl.getMsg);

// create message
app.post("/api/message", messageCrtl.create);

// verify message
app.post("/api/message/:msgHash/verify", messageCrtl.verify);

// code goes here

db.sequelize.sync({ force: !true }).then(() => {
  server.listen(PORT, () => console.log(`server is running at ${PORT}`));
});

app.use(function (error, req, res, next) {
  console.log("st_code", res.statusCode);

  if (error instanceof Error) {
    if (res.statusCode < 400) {
      res.internalServerError();
    }

    return res.json({
      success: false,
      error,
    });
  }

  next(error);
});

module.exports.handler = app;
