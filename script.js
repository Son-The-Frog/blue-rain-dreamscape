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
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.y += this.speed;
        this.x += this.wind;
        if (this.y > height) {
            this.reset();
        }
    }
}

for (let i = 0; i < 100; i++) raindrops.push(new Raindrop());
for (let i = 0; i < 50; i++) snowflakes.push(new Snowflake());

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    snowflakes.forEach(s => {
        s.update();
        s.draw();
    });
    
    raindrops.forEach(r => {
        r.update();
        r.draw();
    });
    
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.drawImage(frogImg, mouseX - 20, mouseY - 20, 40, 40);
    ctx.restore();
    
    requestAnimationFrame(animate);
}
animate();

// Audio Logic
let audioCtx = null;
let rainSource = null;
let rainGain = null;
let lowPassFilter = null;
let isPlaying = false;

async function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // LowPass Filter for that muffled, sleepy feel
    lowPassFilter = audioCtx.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.setValueAtTime(800, audioCtx.currentTime);
    
    rainGain = audioCtx.createGain();
    rainGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    
    // Use a white noise generator for seamless loop
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    rainSource = audioCtx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;
    
    // Connect nodes: Source -> Filter -> Gain -> Destination
    rainSource.connect(lowPassFilter);
    lowPassFilter.connect(rainGain);
    rainGain.connect(audioCtx.destination);
    
    rainSource.start();
}

const audioToggle = document.getElementById('audioToggle');
const toggleText = document.getElementById('toggleText');
const volumeSlider = document.getElementById('volumeSlider');

audioToggle.addEventListener('click', async () => {
    if (!audioCtx) {
        await initAudio();
        isPlaying = true;
        toggleText.innerText = 'Stop the rain';
    } else if (isPlaying) {
        rainGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
        isPlaying = false;
        toggleText.innerText = 'Listen to the rain';
    } else {
        rainGain.gain.setTargetAtTime(0.5, audioCtx.currentTime, 0.1);
        isPlaying = true;
        toggleText.innerText = 'Stop the rain';
    }
});

volumeSlider.addEventListener('input', (e) => {
    if (rainGain) {
        const vol = parseFloat(e.target.value);
        rainGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.1);
    }
});

// Sleepy Toggle Logic
let isSleepy = false;
const sleepyToggle = document.getElementById('sleepyToggle');
const sleepyText = document.getElementById('sleepyText');

// Create sleepy overlay dynamically
const sleepyOverlay = document.createElement('div');
sleepyOverlay.className = 'sleepy-overlay';
document.body.appendChild(sleepyOverlay);

sleepyToggle.addEventListener('click', () => {
    isSleepy = !isSleepy;
    
    if (isSleepy) {
        sleepyText.innerText = 'Wake up';
        sleepyOverlay.classList.add('active');
        if (lowPassFilter) {
            lowPassFilter.frequency.setTargetAtTime(400, audioCtx.currentTime, 1.5);
        }
    } else {
        sleepyText.innerText = 'Go to sleep';
        sleepyOverlay.classList.remove('active');
        if (lowPassFilter) {
            lowPassFilter.frequency.setTargetAtTime(800, audioCtx.currentTime, 1.5);
        }
    }
});