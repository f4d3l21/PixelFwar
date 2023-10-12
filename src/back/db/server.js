const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const db = require('./db.js');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const path = require('path');
const frontPath = path.resolve(__dirname, "../../front");
const bodyParser = require('body-parser');


app.use(express.static(frontPath));


wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
});



app.use(bodyParser.json());

app.post('/setPixel', async (req, res) => {
    const { x, y, color } = req.body;
    
    let conn;
    try {
        conn = await db.getConnection();
        
        const result = await conn.query("INSERT INTO pixels (x, y, color) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE color=?", [x, y, color, color]);

        res.json({ status: 'success' });
    } catch (error) {
        console.error("Error while inserting into the database:", error);
        res.status(500).json({ status: 'error', message: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
});



app.get('/getPixels', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const pixels = await conn.query("SELECT x, y, color FROM pixels");
        res.json(pixels);
    } catch (error) {
        console.error("Erreur lors de la récupération des pixels :", error);
        res.status(500).send("Erreur interne du serveur.");
    } finally {
        if (conn) conn.release();
    }
});



wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'colorPixel') {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'colorPixel',
                        x: data.x,
                        y: data.y,
                        color: data.color
                    }));
                }
            });
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});




app.get('/testDB', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const rows = await conn.query("SELECT 1 as val");
        res.json(rows);
    } catch (error) {
        res.send("Erreur lors de la connexion à la base de données : " + error);
    } finally {
        if (conn) conn.release();
    }
});



server.listen(3000, () => {
    console.log('Listening on port 3000');
});

