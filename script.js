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

const raindropsCount = 150;
const snowflakesCount = 80;
const raindropsArray = new Array(raindropsCount).fill(null).map(() => new Raindrop());
const snowflakesArray = new Array(snowflakesCount).fill(null).map(() => new Snowflake());

let audioCtx = null;
let rainSound = null;
let volumeControl = document.getElementById('volumeSlider');
let audioToggle = document.getElementById('audioToggle');
let toggleText = document.getElementById('toggleText');

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Simple rain noise using white noise and filter
    const bufferSize = 2 * 1024;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    rainSound = { noise, filter, gainNode };
    noise.start();
}

function toggleAudio() {
    if (!audioCtx) {
        initAudio();
    }
    
    if (rainSound.gainNode.gain.value === 0) {
        rainSound.gainNode.gain.setTargetAtTime(0.2, audioCtx.currentTime, 0.1);
        toggleText.innerText = 'Stop the rain';
    }
 else if (rainSound.gainNode.gain.value > 0) {
        rainSound.gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
        toggleText.innerText = 'Listen to the rain';
    }
}

function updateVolume() {
    if (rainSound) {
        rainSound.gainNode.gain.value = volumeControl.value * 0.2;
    }
}

audioToggle.addEventListener('click', toggleAudio);
volumeControl.addEventListener('input', updateVolume);

let isSleepy = false;
let sleepyToggle = document.getElementById('sleepyToggle');
let sleepyText = document.getElementById('sleepyText');
let sleepyOverlay = document.createElement('div');

sleepyOverlay.className = 'sleepy-overlay';
document.body.appendChild(sleepyOverlay);

sleepyToggle.addEventListener('click', () => {
    isSleepy = !isSleepy;
    sleepyText.innerText = isSleepy ? 'Wake up' : 'Sleep';
    sleepyOverlay.classList.toggle('active');
});

function drawFrog() {
    const centerX = width / 2;
    const centerY = height * 0.85;
    const baseScale = 0.15;
    
    // Breathing pulse effect
    const pulse = 1 + Math.sin(Date.now() * 0.0015) * 0.02;
    const scale = baseScale * pulse;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.drawImage(frogImg, -frogImg.width / 2, -frogImg.height / 2); 
    ctx.restore();
}

function drawUmbrella() {
    const centerX = width / 2;
    const centerY = height * 0.85;
    const baseScale = 0.15;
    
    // Umbrella follows the breathing pulse of the frog
    const pulse = 1 + Math.sin(Date.now() * 0.0015) * 0.02;
    const scale = baseScale * pulse;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.drawImage(umbrellaImg, -umbrellaImg.width / 2, -umbrellaImg.height / 2);
    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Background gradient is handled by CSS
    
    snowflakesArray.forEach(s => {
        s.update();
        s.draw();
    });
    
    raindropsArray.forEach(r => {
        r.update();
        r.draw();
    });
    
    drawFrog();
    drawUmbrella();
    
    requestAnimationFrame(animate);
}

frogImg.onload = () => {
    requestAnimationFrame(animate);
}

// Ensure the animation starts even if images fail to load
umbrellaImg.onload = () => {
    if (!frogImg.complete) {
        requestAnimationFrame(animate);
    }
}
