
import './App.css';

const { io } = require('socket.io-client')

function App() {
  return (

    <div className="h-screen flex flex-col">
      <div className="text-center h-full flex flex-row justify-center items-center">

        <div className="inline-block inset-0">
          <button className="btn" type="button" onClick={screenCapture}>
              Start Capture
          </button>
        </div>
        <div className="inline-block ml-5">
          <button type="button" className="btn" onClick={stopCapture} >
              Stop Capture
          </button>
        </div>

        <div className="inline-block ml-5">
          <button type="button" className="btn" onClick={startRecording}>
              Start Record
          </button>
        </div>

        <div className="inline-block ml-5">
          <button type="button" className="btn" onClick={stopRecording} >
              Stop Recording
          </button>
        </div>
      </div>

      <div className="justify-center items-center text-center">
        
        <div className="inline-block ">

          <video width="500"   autoPlay id="--screencapture-element"/>
        </div>
        <div className="inline-block ">
          <button type="button" onClick={playRecord} className="py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
              Play Record
          </button>
          <video width="500" autoPlay id="--screencapture-record"/>
        </div>
      </div>
    </div>
  );
}

let socket = io('ws://localhost:3000/');

let count = 0;
async function playRecord(){
  // var blob = new Blob(data, {
  //   type: "video/webm"
  // });
  
  // const video = document.getElementById('--screencapture-record')

  // video.src= URL.createObjectURL(blob)

  // const socket = io("ws://localhost:3000");
  socket.emit("hello", "im am sameer"+ count)
  count++

  socket.emit('blobdata', data)
  
}

async function screenCapture(){
  const video = document.getElementById('--screencapture-element')
  video.srcObject = await navigator.mediaDevices.getDisplayMedia({
    video: {
      aspectRatio: 16 / 9,
    },
    audio: {
      echoCancellation: true,
      sampleRate: 44100,
    },
  });
  console.log(video.srcObject.getVideoTracks())
}

function stopCapture(){
  const video = document.getElementById('--screencapture-element');

  video.srcObject.getTracks().forEach(stream => stream.stop());

  video.srcObject = null;
}

function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

let data = [];


let recorder;
async function startRecording() {
  // const socket = io("ws://localhost:3000/");


  let lengthInMS = 100

  const video = document.getElementById('--screencapture-element');
  let stream = video.srcObject

  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = event => {
    console.log(event.data)
    data.push(event.data);
  }

  recorder.start(10);
  console.log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");

  return data;
}

async function stopRecording(){

  const lengthInMS = 100
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(
    () => recorder.state === "recording" && recorder.stop()
  );
  
  console.log(data)
  await Promise.all([
    stopped,
    recorded
  ]);
}
export default App;
