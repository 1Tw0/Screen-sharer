
import { useEffect, useMemo, useState } from 'react';
import './App.css';

const { io } = require('socket.io-client')


var mimeCodec = 'video/webm; codecs="vp09.00.10.08"';
function App() {
    const socket = useMemo(()=>{
        return io('ws://localhost:3000/')
    },[])
    const [data,setData] = useState (()=>{
        return []
    })
    const [source, setSource] = useState(new MediaSource())
    const [sourceBuffer, setSourceBuffer] = useState(null)
    const [wdata,setWdata] = useState (()=>{
        return []
    })
    const [recorder, setRecorder] = useState(() => {
      return new MediaRecorder(new MediaStream())
    })
  
    const [stopRec, setStopRec] = useState(() => false)
    const [captureStarted, setCaptureStarted] = useState(() => false)
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        socket.on("getblobs", (d) => {
            console.log('dataaaa*********',  d)
            setData((prev) => d)

            var blob = new Blob(d, {
                type: "video/webm"
            })
            const video = document.getElementById('--screencapture-record')
            setSourceBuffer(async prevBuffer => {

                let buffers = await blob.arrayBuffer()
                // console.log('state......', prevBuffer.read)
                // for(let t in d)
                prevBuffer.addEventListener('updateend', () => {
                    source.endOfStream()
                    video.play()
                })

                await prevBuffer.appendBufferAsync(buffers)
                
                return prevBuffer
            })
            setWdata((prev) =>[...prev, d])
          })
    },[data, socket, source])

    useEffect(() => {
        const video = document.getElementById('--screencapture-record')
        video.src= URL.createObjectURL(source)
        
        source.addEventListener('sourceopen', () => {
            var sBuffer = source.addSourceBuffer(mimeCodec);

            sBuffer.addEventListener('updateend', () => {
                source.endOfStream()
                video.play()
            })

            setSourceBuffer(sBuffer)
        })
    }, [source])

    // useEffect(() => {

    //     //const temp = getData()
    
    //     // console.log('setting..', data)
    //     var blob = new Blob(data, {
    //       type: "video/webm"
    //     });
        
    //     const video = document.getElementById('--screencapture-record')
    //     console.log('In Effect... source', data)
    //     // source.addEventListener('sourceopen', () => {
    //     //     // let url = URL.createObjectURL(blob)
    //     //     console.log('in effect .... sourceopened')
    //     //     source.addSourceBuffer(mimeCodec)

    //     //     source.addEventListener('onsourceended', function (_) {
    //     //         // source.endOfStream();
    //     //         // video.play();
    //     //         console.log('Media source Stream ended')
    //     //         // console.log(mediaSource.readyState); // ended
    //     //     });

    //     //     // blob.arrayBuffer()
    //     //     // .then((d) => {
    //     //     //     sourceBuffer.appendBuffer(d);
    //     //     // })

            
    //     // });
    //     // for(let d in data)
    //     //     setSourceBuffer(prev => {
    //     //         prev.appendBuffer(d)
    //     //         return prev
    //     //     });

    //     async function getBuffer() {
    //         let buffer = await blob.arrayBuffer()
    //         return buffer
    //     }

    //     let buffers = getBuffer()

    //     if (source.readyState === 'open')
    //         setSourceBuffer(prev => {
    //             prev.appendBuffer(buffers)

    //             return prev
    //         })


    //   },[data, source])

    const startRecording = async () => {

        const video = document.getElementById('--screencapture-element');
        let stream = video.srcObject
        const rec = new MediaRecorder(stream)
      
        rec.ondataavailable = event => {
          console.log('data avialble', event.data)
          if(stopRec === false)
            // socket.emit("blobdata", event.data)
            setData(prev => [...prev, ...event.data])
        }
        
        setRecorder(rec)
        setStopRec(true)
        rec.start(100)
        // rec.stop()
    }
    const playRecord = () => {
        console.log(wdata)
        var blob = new Blob(wdata, {
        type: "video/webm"
        });
        
        const video = document.getElementById('--screencapture-record')
    
        video.src= URL.createObjectURL(blob)

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
        
        // console.log('state:   ', recorder.state)
        let recorded = wait(lengthInMS).then(
          () => recorder.state === "recording" && recorder.stop()
        );
        
        await Promise.all([
          stopped,
          recorded
        ]);
    
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
    );
}

function wait(delayInMS) {
    return new Promise(resolve => setTimeout(resolve, delayInMS));
}


export default App;
