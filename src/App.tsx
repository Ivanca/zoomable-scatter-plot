import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { ScatterPlot } from './components/ScatterPlot';
import { Logo } from './components/Logo';

function App() {
  const [data, setData] = React.useState([]);
  // import data from "./data.json";
  useEffect(() => {
    fetch("./data.json")
      .then(res => res.json())
      .then(data => {
        setData(data);
      });
  }, []);

  return (
    <>
      <Logo height={100} />
      <ScatterPlot data={data} width={window.innerHeight} height={window.innerHeight - 100} />
    </>
  );
}

export default App;
