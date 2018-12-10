const { getJwtFromSocket } = require("./app/jwt");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const routes = require("./app/routes");
const dotenv = require("dotenv");
const mssql = require("./mssql");
const fs = require("fs");
const TYPES = require("tedious").TYPES;
dotenv.config();
const port = process.env.PORT || 8080;

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  const startTime = Date.now();
  console.log("Request Time: " + startTime);
  console.log(`${req.method} ${req.path}`);
  next();

  const endTime = Date.now();
  console.log("Response Time: " + endTime + " Elapsed: " + (endTime - startTime));
});

app.use("/node-api/server.js/schedule", (req, res, next) => {
  fs.readFile("data/schedule.json", (err, data) => {
    if (err) {
      next(err);
    } else {
      res.type("json").send(data);
    }
  });
});

app.use("/node-api/server.js/", routes);

app.use((req, res) => {
  res.status(404).send("<h2>The path is not valid</h2>");
});

const socket = require("socket.io");
const server = require("http").createServer(app);

const connections = {};

io = socket(server);

io.on("connection", socket => {
  socket.on("error", error => {
    console.log("error on socket", socket.id, error);
  });

  console.log(socket.id);
  //get current user and store it
  const currentSocketId = socket.id;
  const user = getJwtFromSocket(socket);
  if (!user) {
    setTimeout(() => socket.disconnect(true), 5000);
    return null;
  }

  let connectionForUser = connections[user.tenantId];
  if (!connectionForUser) {
    connectionForUser = [];
    connections[user.tenantId] = connectionForUser;
  }

  connectionForUser.push(socket.id);
  socket.on("SEND_MESSAGE", onSend);
  function onSend(data) {
    console.log(data, "incoming");
    console.log(data.to);
    console.log(user.tenantId);
    console.log(connections);
    const socketsForTenant = connections[data.to];
    console.log(socketsForTenant, "tenant");
    const sentToConnections = {};

    for (const socketId of socketsForTenant || []) {
      if (!sentToConnections[socketId]) {
        io.to(socketId).emit("RECEIVE_MESSAGE", data);
      }
      sentToConnections[socketId] = true;
    }

    for (const socketId of connections[1]) {
      if (!sentToConnections[socketId]) {
        io.to(socketId).emit("RECEIVE_MESSAGE", data);
      }
      sentToConnections[socketId] = true;
    }

    console.log(connections[user.tenantId]);

    return mssql
      .executeProc("ChatMessage_Insert", sqlRequest => {
        sqlRequest.addOutputParameter("Id", TYPES.Int, null);
        sqlRequest.addParameter("tenantId", TYPES.Int, data.to);
        sqlRequest.addParameter("Message", TYPES.NVarChar, data.message);
        sqlRequest.addParameter("FromUserId", TYPES.Int, user.id);
      })
      .then(response => {
        console.log(response);
        return response.outputParameters;
      });
  }
  socket.on("disconnect", socket => {
    // get the array for this user ID from connections
    // remove the socket.id from that array
    // check if the arry is empty, if so "delete connections[userId]"
    console.log(user.tenantId, "gone");
    console.log(currentSocketId);
    const filteredConnections = connections[user.tenantId].filter(connection => {
      return currentSocketId !== connection;
    });
    if (filteredConnections.length === 0) {
      delete connections[user.tenantId];
    } else {
      connections[user.tenantId] = filteredConnections;
    }
  });
});
server.listen(port);
