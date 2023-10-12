const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const ws = new WebSocket('ws://localhost:3000');
let currentColor = '#ff0000';


colorPicker.addEventListener('change', (event) => {
    currentColor = event.target.value;
});


canvas.addEventListener('click', (event) => {
    const x = Math.floor(event.offsetX / 10) * 10;
    const y = Math.floor(event.offsetY / 10) * 10;
    
    ctx.fillStyle = currentColor;
    ctx.fillRect(x, y, 10, 10);

    fetch('/setPixel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            x: x,
            y: y,
            color: currentColor
        }),
    }).catch((error) => {
        console.error('Error:', error);
    });

    ws.send(JSON.stringify({
        type: 'colorPixel',
        x: x,
        y: y,
        color: currentColor
    }));

});


function loadPixels() {
    fetch('/getPixels')
        .then(response => response.json())
        .then(pixels => {
            pixels.forEach(pixel => {
                ctx.fillStyle = pixel.color;
                ctx.fillRect(pixel.x, pixel.y, 10, 10);
            });
        })
        .catch(error => {
            console.error('Erreur lors du chargement des pixels:', error);
        });
}

loadPixels();



ws.onopen = (event) => {
    console.log('Connected to the WebSocket');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'colorPixel') {
        ctx.fillStyle = data.color;
        ctx.fillRect(data.x, data.y, 10, 10);
    }
};



ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};


ws.onclose = (event) => {


    if (event.wasClean) {
        console.log('Closed cleanly');
    } else {
        console.error('Connection died');
    }
};
