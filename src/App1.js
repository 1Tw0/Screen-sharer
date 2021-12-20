
import { useEffect, useMemo, useState } from 'react';
import './App.css';

const { io } = require('socket.io-client')

// function App(){

//   const [count, setCount] = useState(0)

//   const socket = useMemo(() => {

//     let sock = io('ws://localhost:3000')

//     sock.on("test", (data) => {
//       console.log(data)

//       setCount(count+data)
//     })

//     return sock
//   }, [count])

//   const pingServer = () => {
//     socket.emit("ping")
//   }
//   return (
//     <div>
//       <button onClick={pingServer}>ping</button>
//       {count}</div>
//   )
// }

function useData(socket){

  const [data, setupData] = useState(()=>{
    
    return []
  })

  useEffect(() => {
    socket.on("getblobs", (d) => {
      console.log('dataaaa*********',  d)
      setupData((prev) => [...prev, d])
    })
  }, [socket])

  const [pointer, setPointer] = useState(0)

  function getData(){
    const temp = data.slice(pointer+1)
    setPointer(pointer+temp.length)

    return temp
  }

  return [getData]
}
function useSocket(){

  
  const socket = useMemo(() => {

    let sock = io('ws://localhost:3000/')
    return sock
    
  }, [])

  const [getData] = useData(socket)

   return [socket, getData]
}

function App() {
  const [socket, getData] = useSocket()
  const [recorder, setRecorder] = useState(() => {
    return new MediaRecorder(new MediaStream())
  })

  const [stopRec, setStopRec] = useState(() => false)
  const [captureStarted, setCaptureStarted] = useState(() => false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    const temp = getData()

    console.log('setting..', temp)
    var blob = new Blob(temp, {
      type: "video/webm"
    });
    
    const video = document.getElementById('--screencapture-record')
    video.src= URL.createObjectURL(blob)

  },[getData])


  const startRecording = async () => {

    const video = document.getElementById('--screencapture-element');
    let stream = video.srcObject
    const rec = new MediaRecorder(stream)
  
    rec.ondataavailable = event => {
      // console.log('data avialble', event.data.length)
      if(stopRec === false)
        socket.emit("blobdata", event.data)
    }
    
    setRecorder(rec)
    setStopRec(true)
    rec.start(100)
    // rec.stop()
  }

  const stopRecording = async () => {

    setLoading(true)
    setStopRec(false)

    const lengthInMS = 100
    let stopped = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = event => reject(event.name);
      setLoading(false)
      
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

  const playRecord = () => {
    // console.log('data:',data)
    // setStopRec(false)
    // var blob = new Blob(data, {
    //   type: "video/webm"
    // });
    
    // const video = document.getElementById('--screencapture-record')
  
    // video.src= URL.createObjectURL(blob)
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
  
    setCaptureStarted(true)
  }

  function stopCapture(){
    const video = document.getElementById('--screencapture-element');
  
    video.srcObject.getTracks().forEach(stream => stream.stop());
  
    video.srcObject = null;

    setCaptureStarted(false)
    setStopRec(true)
  }
  
  return (
    <>
    {
      loading === true
      ?
      <div class="w-10 h-10 m-4 border-t-2 border-b-2 border-green-900 rounded-full animate-spin"></div>
      :
      <></>
    }
    <div className="h-screen flex flex-col">
      
      <div className="text-center h-full flex flex-row justify-center items-center">
        {
          captureStarted === false
          ?
          <div className="inline-block inset-0">
            <button className="btn" type="button" onClick={screenCapture}>
                Start Capture
            </button>
          </div>
          :        
          <div className="inline-block ml-5">
            <button type="button" className="btn" onClick={stopCapture} >
                Stop Capture
            </button>
          </div>
        }
        
        {
          captureStarted
          ?
          <>{
            stopRec === false 
            ?
            <div className="inline-block ml-5">
              <button type="button" className="btn" onClick={startRecording}>
                  Start Record
              </button>
            </div>
            :
            <div className="inline-block ml-5">
              <button type="button" className="btn" onClick={stopRecording} >
                  Stop Recording
              </button>
            </div>
          }</>
          :
          <></>
        }
        <button type="button" onClick={playRecord} className="py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-auto transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
            Play Record
        </button>
        
      </div>

      <div className="justify-center items-center text-center">
        
        <div className="inline-block">

          <video width="500"   autoPlay id="--screencapture-element"/>
        </div>
        <div className="inline-block">
          <video width="500" autoPlay id="--screencapture-record"/>
        </div>
      </div>
    </div>
    </>
  );
}





function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

export default App;

