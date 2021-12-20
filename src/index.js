import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Counter/>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
function Counter() {

  const [counter,setCounter] = useState(() => 0)
  useEffect (()=>{
   const timer = setInterval(()=>{
       setCounter(prev => prev+1 )
   },1000)   
   return () => {
    clearInterval(timer);
  };
  })
  return(
  <div className='text-9xl'>
          {counter}
  </div>
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
