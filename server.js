// ***************************************************
// Imports
const express = require("express");
const app = express();
const server = require("http").Server(app);
const http = require("http");
const { ExpressPeerServer } = require("peer");
// ***************************************************
// To server the socketio.js files on the server
const io = require("socket.io")(server);
// ***************************************************
const { v4: uuidV4 } = require("uuid");
// ***************************************************
app.set("view engine", "ejs");
app.use(express.static("public"));

const pr = app.listen(3001);

const peerServer = ExpressPeerServer(pr, {
  path: "/",
});

app.use("/", peerServer);
// ***************************************************
// Routes

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});
app.get("/:room", (req, res) => {
  res.render("room", { roomID: req.params.room });
});

// ***************************************************
// Socket IO Logic
io.on("connection", (socket) => {
  socket.on("join-room", (roomID, userID) => {
    onJoinRoom(roomID, userID, socket);
  });
});

function onJoinRoom(roomID, userID, socket) {
  console.log("roomID : " + roomID, "userID : " + userID);
  socket.join(roomID);
  socket.to(roomID).emit("user-connected", userID);
  socket.on("disconnect", () =>
    socket.broadcast.to(roomID).emit("user-disconnected", userID)
  );
}

// ***************************************************
server.listen(process.env.PORT || 3000, () => console.log("Started"));
// ***************************************************
