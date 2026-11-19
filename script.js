const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');
let width, height;
let raindrops = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

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
        this.y += this.speed;
        if (this.y > height) {
            this.reset();
        }
    }
}

for (let i = 0; i < 150; i++) {
    raindrops.push(new Raindrop());
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    raindrops.forEach(drop => {
        drop.update();
        drop.draw();
    });
    requestAnimationFrame(animate);
}

animate();

// Audio Setup
const audioToggle = document.getElementById('audioToggle');
const toggleText = document.getElementById('toggleText');
const volumeSlider = document.getElementById('volumeSlider');
const rainSound = new Audio('https://www.soundjay.com/nature/rain-01.mp3');
rainSound.loop = true;

let isPlaying = false;

function toggleRainSound() {
    if (isPlaying) {
        rainSound.pause();
        toggleText.textContent = 'Listen to the rain';
    } else {
        rainSound.play();
        toggleText.textContent = 'Stop the rain';
    }    
    isPlaying = !isPlaying;
}

audioToggle.addEventListener('click', toggleRainSound);

volumeSlider.addEventListener('input', (e) => {
    rainSound.volume = e.target.value;
});

window.addEventListener('click', () => {
    if (!isPlaying) {
        toggleRainSound();
    }
}, { once: true });

// Sleepy Mode
const sleepyToggle = document.getElementById('sleepyToggle');
const sleepyText = document.getElementById('sleepyText');

// Create the dimming overlay
const dimOverlay = document.createElement('div');
dimOverlay.className = 'sleepy-overlay';
document.body.appendChild(dimOverlay);

let isSleepy = false;

function toggleSleepyMode() {
    isSleepy = !isSleepy;
    if (isSleepy) {
        dimOverlay.classList.add('active');
        sleepyText.textContent = 'Wake up';
    } else {
        dimOverlay.classList.remove('active');
        sleepyText.textContent = 'Go to sleep';
    }    
}

// I want it to start sleepy by default or be a toggle
// Let's make the button text reflect the state
sleepyText.textContent = 'Go to sleep';

sleepyToggle.addEventListener('click', toggleSleepyMode);
