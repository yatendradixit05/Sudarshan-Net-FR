import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [data, setData] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Live Stats
        const statsRes = await axios.get('http://localhost:5000/api/stats');
        setData(statsRes.data);
        
        // Fetch PCAP Files
        const filesRes = await axios.get('http://localhost:5000/api/files');
        setFiles(filesRes.data);
      } catch (err) {
        console.error("Backend unreachable");
      }
    };

    const interval = setInterval(fetchData, 2000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '40px', backgroundColor: '#0a0a0a', color: '#00ff41', minHeight: '100vh', fontFamily: 'monospace' }}>
      <header style={{ borderBottom: '2px solid #00ff41', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>🛰️ CYBER SUDARSHAN | NETWORK FLIGHT RECORDER</h1>
          <p>Live Forensic Data Capture Engine</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#fff' }}>STATUS: <span style={{ color: '#00ff41' }}>● RECORDING</span></p>
        </div>
      </header>
      
      {/* THE GRAPH */}
      <div style={{ height: '300px', width: '100%', backgroundColor: '#111', borderRadius: '5px', padding: '10px', border: '1px solid #333' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="timestamp" hide />
            <YAxis stroke="#444" />
            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00ff41' }} />
            <Area type="monotone" dataKey="size" stroke="#00ff41" fill="#00ff4133" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* PCAP RETRIEVAL SECTION */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#111', border: '1px solid #333' }}>
        <h3>📁 RETRIEVE BLACK BOX DATA (PCAPs)</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          {files.length === 0 ? <p style={{color: '#555'}}>No recordings found yet...</p> : 
            files.map((file, i) => (
              <a key={i} href={file.url} download style={{ color: '#00ff41', textDecoration: 'none', border: '1px solid #00ff41', padding: '5px 10px', borderRadius: '3px', fontSize: '12px' }}>
                📥 {file.name}
              </a>
            ))
          }
        </div>
      </div>

      {/* LOG TABLE */}
      <div style={{ marginTop: '30px' }}>
        <h3>LIVE PACKET LOGS</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#00ff41', fontSize: '14px' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#888', borderBottom: '1px solid #333' }}>
              <th>Timestamp</th><th>Source</th><th>Destination</th><th>Size (Bytes)</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(-10).reverse().map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                <td>{p.timestamp}</td><td>{p.src}</td><td>{p.dst}</td><td>{p.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;