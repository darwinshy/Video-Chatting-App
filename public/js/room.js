const socket = io.connect("https://chatonws.herokuapp.com", {
  withCredentials: true,
  transports: ["websocket"],
});
const peers = {};
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const videoBox = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    addVideoStream(myVideo, stream);
    recieveCall(stream);
    socket.on("user-connected", (userId) => connectToNewUser(userId, stream));
  });

myPeer.on("open", (id) => socket.emit("join-room", ROOM_ID, id));
socket.on("user-disconnected", (userId) =>
  peers[userId] ? peers[userId].close() : null
);

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => video.play());
  video.classList.add("myVideo");
  videoBox.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) =>
    addVideoStream(video, userVideoStream)
  );
  call.on("close", () => video.remove());
  peers[userId] = call;
}

function recieveCall(stream) {
  myPeer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  });
}
