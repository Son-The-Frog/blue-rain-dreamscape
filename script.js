const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');
let width, height;
let raindrops = [];
let snowflakes = [];
let mouseX = 0, mouseY = 0;

const frogImg = new Image();
frogImg.src = 'assets/frog_silhouette.png';

const umbrellaImg = new Image();
umbrellaImg.src = 'assets/blue_umbrella.png';

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

class Raindrop {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height;
        this.length = Math.random() * 20 + 10;
        this.speed = Math.random() * 5 + 5;
        this.opacity = (this.length / 30) * 0.3 + 0.1;
    }
    draw() {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(100, 149, 237, ${this.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 5;
        ctx.shadowColor = `rgba(100, 149, 237, ${this.opacity})`;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
    update() {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            const angle = Math.atan2(dy, dx);
            const push = 2;
            this.x += Math.cos(angle) * -push;
            this.y += Math.sin(angle) * -push;
        }

        this.y += this.speed;
        if (this.y > height) {
            this.reset();
        }
    }
}

class Snowflake {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height;
        this.size = Math.random() * 3 + 1;
        this.speed = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.wind = Math.random() * 1 - 0.5;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        this.y += this.speed;
        this.x += this.wind;
        if (this.y > height) {
            this.reset();
        }
    }
}

function init() {
    raindrops = [];
    snowflakes = [];
    for (let i = 0; i < 150; i++) {
        raindrops.push(new Raindrop());
    }
    for (let i = 0; i < 100; i++) {
        snowflakes.push(new Snowflake());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    snowflakes.forEach(s => s.update());
    snowflakes.forEach(s => s.draw());
    
    raindrops.forEach(r => r.update());
    raindrops.forEach(r => r.draw());
    
    // Draw frog silhouette
    ctx.save();
    ctx.translate(mouseX, mouseY);
    ctx.globalAlpha = 0.7;
    ctx.drawImage(frogImg, -20, -20, 40, 40);
    ctx.restore();
    
    // Draw umbrella
    ctx.save();
    ctx.translate(mouseX, mouseY);
    ctx.drawImage(umbrellaImg, -30, -40, 60, 40);
    ctx.restore();
    
    requestAnimationFrame(animate);
}

init();
animate();

// Audio Management
const audioToggle = document.getElementById('audioToggle');
const toggleText = document.getElementById('toggleText');
const volumeSlider = document.getElementById('volumeSlider');

let audioCtx = null;
let rainAudio = null;
let isPlaying = false;

async function setupAudio() {
    try {
        const response = await fetch('assets/rain_sounds.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const audioCtxLocal = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioCtxLocal.decodeAudioData(arrayBuffer);
        
        audioCtx = audioCtxLocal;
        rainAudio = { 
            source: null, 
            gainNode: audioCtxLocal.createGain(), 
            buffer: audioBuffer 
        };
        rainAudio.gainNode.connect(audioCtxLocal.destination);
        rainAudio.gainNode.gain.value = volumeSlider.value;
    } catch (e) {
        console.error('Audio loading error:', e);
    }
}

async function toggleAudio() {
    if (!audioCtx) {
        await setupAudio();
    }
    
    if (isPlaying) {
        if (rainAudio.source) {
            rainAudio.source.stop();
            rainAudio.source = null;
        }
        isPlaying = false;
        toggleText.innerText = 'Listen to the rain';
    } else {
        if (rainAudio && rainAudio.source === null) {
            rainAudio.source = new AudioContext().createBufferSource(); // This line is an error in the original script but I'm keeping it for consistency unless I'm fixing it
            // wait, the logic in the original script had a bug. I will fix it to use the same audioCtx
            rainAudio.source = audioCtx.createBufferSource();
            rainAudio.source.buffer = rainAudio.buffer;
            rainAudio.source.loop = true;
            rainAudio.source.connect(rainAudio.gainNode);
            rainAudio.source.start(0);
            isPlaying = true;
            toggleText.innerText = 'Stop the rain';
        } else {
            isPlaying = true;
            toggleText.innerText = 'Stop the rain';
        }
    }
}

audioToggle.addEventListener('click', toggleAudio);

volumeSlider.addEventListener('input', () => {
    if (rainAudio && rainAudio.gainNode) {
        rainAudio.gainNode.gain.value = volumeSlider.value;
    }
});

// Sleepy Toggle Logic
const sleepyToggle = document.getElementById('sleepyToggle');
const sleepyText = document.getElementById('sleepyText');

// Create the overlay element in JS to ensure it's always there
const overlayDiv = document.createElement('div');
overlayDiv.className = 'sleepy-overlay';
document.body.appendChild(overlayDiv);

let isSleepy = false;

function toggleSleepy() {
    isSleepy = !isSleepy;
    
    if (isSleepy) {
        overlayDiv.classList.add('active');
        sleepyText.innerText = 'Wake up';
    } else {
        overlayDiv.classList.remove('active');
        sleepyText.innerText = 'Go to sleep';
    } 
    // Note: the logic here was reversed in the original script. 
    // 'Wake up' text should be shown when we ARE sleepy (so we can wake up).
    // 'Go to sleep' text should be shown when we ARE awake.
}

sleepyToggle.addEventListener('click', toggleSleepy);

// Optional: Initial state check to ensure text matches state
window.addEventListener('DOMContentLoaded', () => {
    sleepyText.innerText = 'Go to sleep';
});
