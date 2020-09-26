const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

let msg = document.getElementById('chat-message')
let msgForm = document.getElementById('chat-message-form')

msgForm.onsubmit = (e) => {
  e.preventDefault();
  let message = msg.value.trim();
  if (message.length > 0) {
    socket.emit('message', message);
    msg.value = '';
  }
} 

socket.on('createMessage', (message) => {
  var li = document.createElement("li");
  li.innerHTML = `<b>user</b><br/>${message}`;
  document.querySelector('ul.messages').append(li)
  scrollToBottom();
})

const scrollToBottom = () => {
  let d = $('.main__chat-window');
  d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmuteBtn = document.getElementById('mute-unmute-btn');
const videoOnOffBtn = document.getElementById('video-on-off-btn');

muteUnmuteBtn.onclick = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if(enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  muteUnmuteBtn.innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="fas fa-microphone-slash muted"></i>
    <span>Unmute</span>
  `
  muteUnmuteBtn.innerHTML = html;
}

videoOnOffBtn.onclick = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if(enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setPlayVideo = () => {
  const html = `
    <i class="fas fa-video-slash muted-video"></i>
    <span>Play Video</span>
  `
  videoOnOffBtn.innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  videoOnOffBtn.innerHTML = html;
}