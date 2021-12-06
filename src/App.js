
import { useEffect, useMemo, useState } from 'react';
import './App.css';

const { io } = require('socket.io-client')

function App() {

  const [data, setData] = useState([], () => {
    console.log('data STATE:', data)
  })

  const [recorder, setRecorder] = useState(() => {
    return new MediaRecorder(new MediaStream())
  })

  const socket = useMemo(() => {

    let socket = io('ws://localhost:3000/');

    socket.on("getblobs", async (d) => {

      async function set(){
        const dd = [...data, ...d]
        setData(dd)
      }
      await set()
    })

    return socket
  }, [data])
  

  useEffect(()=>{

    console.log('use Effect-----', data)
    if(data.length !== 0){
      var blob = new Blob(data, {
        type: "video/webm"
      });
      
      const video = document.getElementById('--screencapture-record')
    
      video.src= URL.createObjectURL(blob)
    }
  }, [data])



  const startRecording = async () => {

    const video = document.getElementById('--screencapture-element');
    let stream = video.srcObject
    const rec = new MediaRecorder(stream)
  
    rec.ondataavailable = event => {
      socket.emit("blobdata", event.data)
    }

    setRecorder(rec)
    rec.start(10);
  }

  const stopRecording = async () => {
    const lengthInMS = 100
    let stopped = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = event => reject(event.name);
    });
    
    console.log('state:   ', recorder.state)
    let recorded = wait(lengthInMS).then(
      () => recorder.state === "recording" && recorder.stop()
    );
    
    await Promise.all([
      stopped,
      recorded
    ]);
  }
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
          {/* <button type="button" onClick={playRecord} className="py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
              Play Record
          </button> */}
          <video width="500" autoPlay id="--screencapture-record"/>
        </div>
      </div>
    </div>
  );
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
  // console.log(video.srcObject.getVideoTracks())
}

function stopCapture(){
  const video = document.getElementById('--screencapture-element');

  video.srcObject.getTracks().forEach(stream => stream.stop());

  video.srcObject = null;
}

function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

export default App;
