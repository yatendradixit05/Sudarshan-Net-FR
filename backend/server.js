const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const LOG_FILE = path.join(__dirname, '../network_log.json');
const PACKET_DIR = path.join(__dirname, '../packets');

// Endpoint for the Live Graph
app.get('/api/stats', (req, res) => {
    if (!fs.existsSync(LOG_FILE)) return res.json([]);
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Read Error" });
        const lines = data.trim().split('\n').map(line => {
            try { return JSON.parse(line); } catch(e) { return null; }
        }).filter(l => l !== null);
        res.json(lines.slice(-50)); 
    });
});

// Endpoint to list PCAP files for the Time Machine
app.get('/api/files', (req, res) => {
    if (!fs.existsSync(PACKET_DIR)) return res.json([]);
    const files = fs.readdirSync(PACKET_DIR)
        .filter(f => f.endsWith('.pcap')) // Fixed typo: endsWith
        .map(f => ({ name: f, url: `http://localhost:5000/download/${f}` }));
    res.json(files);
});

// Serve the actual files for download
app.use('/download', express.static(PACKET_DIR));

app.listen(5000, () => console.log("🚀 Cyber Sudarshan Bridge Active on Port 5000"));