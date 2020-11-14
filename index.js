const PORT = process.env.PORT || 3000;
const express = require("express");
const model = require("./models/index");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const server = express();
const http = require("http").createServer(server);
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios=require("axios")
server.use(cors());
server.use(express.static("public"));
server.post("/login", bodyParser.json(), async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = await model.User.findOne({ where: { username } });

    if (users) {
      const cek = await bcrypt.compare(password, users.password);
      if (cek) {
        const token = jwt.sign({ token: users.token }, process.env.SECRET);
        return res.json({
          status: true,
          messages: "OK",
          data: {
            username: users.username,
            role: users.role,
            token: token,
          },
        });
      } else {
        throw new Error("wrong pass");
      }
    } else {
      return res.json({
        status: false,
        messages: "EMPTY",
        data: {},
      });
    }
  } catch (err) {
    return res.json({
      status: false,
      messages: err.message,
      data: {},
    });
  }
});
http.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connect", (socket) => {
  socket.on("chat message", (data) => {
    const { username, message } = data;
    if (data.token) {
      jwt.verify(data.token, process.env.SECRET, function (err, decoded) {
        let sendMessage = message;
        chatbot(io, sendMessage, "admin");
      });
    } else {
      let sendMessage = message;
      chatbot(io, sendMessage, username);
    }
  });
});
function chatbot(io, sendMessage, username) {
  if (/^coronabot\sconfirmed$/gi.test(sendMessage)) {
    axios
      .get("https://covid19.mathdro.id/api/")
      .then((res) =>
        io.emit("chat message", {
          username,
          message: `confirmed in coronavirus case ${res.data.confirmed.value}`,
          role: username === "admin" ? "admin" : null,
        })
      );
  } else if (/^coronabot\srecovered$/gi.test(sendMessage)) {
    axios
      .get("https://covid19.mathdro.id/api/")
      .then((res) =>
        io.emit("chat message", {
          username,
          message: `recovered in coronavirus case ${res.data.recovered.value}`,
          role: username === "admin" ? "admin" : null,
        })
      );
  } else if (/^coronabot\sdeaths$/gi.test(sendMessage)) {
    axios
      .get("https://covid19.mathdro.id/api/")
      .then((res) =>
        io.emit("chat message", {
          username,
          message: `deaths in coronavirus case ${res.data.deaths.value}`,
          role: username === "admin" ? "admin" : null,
        })
      );
  } else if (/^coronabot\shelp$/gi.test(sendMessage)) {
    axios
      .get("https://covid19.mathdro.id/api/")
      .then((res) =>
        io.emit("chat message", {
          username,
          message: `you can check the latest coronavirus case in the world by using this command:\n1. coronabot confirmed\n2. coronabot deaths\n3. coronabot recovered\nagain i just want to remind you to always wash your hand`,
          role: username === "admin" ? "admin" : null,
        })
      );
  } else {
    io.emit("chat message", {
      username,
      message: sendMessage,
      role: username === "admin" ? "admin" : null,
    });
  }
}