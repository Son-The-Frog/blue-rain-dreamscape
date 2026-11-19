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
        this.pulseOffset = Math.random() * Math.PI * 2;
    }
    draw() {
        const pulse = Math.sin(Date.now() * 0.003 + this.pulseOffset) * 0.1 + 0.5;
        const currentOpacity = this.opacity * pulse;
        
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.length);
        gradient.addColorStop(0, `rgba(100, 149, 237, 0)`);
        gradient.addColorStop(0.4, `rgba(100, 149, 237, ${currentOpacity})`);
        gradient.addColorStop(1, `rgba(100, 149, 237, 0)`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 5 * pulse;
        ctx.shadowColor = `rgba(100, 149, 237, ${currentOpacity})`;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
        
        ctx.restore();
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
        if (this.y > height) this.reset();
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
        this.drift = Math.random() * 1 - 0.5;
    }
    draw() {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.y += this.speed;
        this.x += this.drift;
        if (this.y > height) this.reset();
    }
}

const raindropsArray = Array.from({ length: 100 }, () => new Raindrop());
const snowflakesArray = Array.from({ length: 150 }, () => new Snowflake());

let isSleepy = false;
const sleepyOverlay = document.createElement('div');
sleepyOverlay.className = 'sleepy-overlay';
document.body.appendChild(sleepyOverlay);

function toggleSleepy() {
    isSleepy = !isSleepy;
    sleepyOverlay.classList.toggle('active', isSleepy);
    document.getElementById('sleepyText').innerText = isSleepy ? 'Wake up' : 'Go to sleep';
}

document.getElementById('sleepyToggle').addEventListener('click', toggleSleepy);

// Audio Setup
let audioCtx = null;
let rainNode = null;
let filterNode = null;
let gainNode = null;

async function setupAudio() {
    if (audioCtx) return;
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a noise source for rain
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    // The 'muffled' effect: Low Pass Filter
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(800, audioCtx.currentTime); // Low frequency for muffled feel
    
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    
    whiteNoise.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    whiteNoise.start();
    rainNode = whiteNoise;
}

const audioToggle = document.getElementById('audioToggle');
const volumeSlider = document.getElementById('volumeSlider');

audioToggle.addEventListener('click', async () => {
    if (!audioCtx) {
        await setupAudio();
        document.getElementById('toggleText').innerText = 'Pause the rain';
    } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
        document.getElementById('toggleText').innerText = 'Pause the rain';
    } else if (audioCtx.state === 'running') {
        audioCtx.suspend();
        document.getElementById('toggleText').innerText = 'Listen to the rain';
    }
});

volumeSlider.addEventListener('input', (e) => {
    if (gainNode) {
        gainNode.gain.setValueAtTime(e.target.value, audioCtx.currentTime);
    }
});

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    raindropsArray.forEach(drop => {
        drop.update();
        drop.draw();
    });
    
    snowflakesArray.forEach(flake => {
        flake.update();
        flake.draw();
    });
    
    requestAnimationFrame(animate);
}

animate();