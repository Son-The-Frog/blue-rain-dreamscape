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
            this.x += Math.cos(angle) * push;
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
        this.wind = Math.random() * 0.5 - 0.25;
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
        this.x += this.wind;
        if (this.y > height) {
            this.reset();
        }
    }
}

function init() {
    for (let i = 0; i < 100; i++) raindrops.push(new Raindrop());
    for (let i = 0; i < 50; i++) snowflakes.push(new Snowflake());
}

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
    ctx.drawImage(frogImg, mouseX - 20, mouseY - 40, 40, 60);
    ctx.drawImage(umbrellaImg, mouseX - 35, mouseY - 65, 70, 40);
    ctx.restore();

    requestAnimationFrame(animate);
}

init();
animate();

let audioCtx;
let rainNoise;
let gainNode;
let lowPassFilter;

async function setupAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    rainNoise = audioCtx.createBufferSource();
    rainNoise.buffer = noiseBuffer;
    rainNoise.loop = true;

    lowPassFilter = audioCtx.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.setValueAtTime(800, audioCtx.currentTime);

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

    rainNoise.connect(lowPassFilter);
    lowPassFilter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    rainNoise.start();
}

const audioToggle = document.getElementById('audioToggle');
const toggleText = document.getElementById('toggleText');
const volumeSlider = document.getElementById('volumeSlider');

let isPlaying = false;

audioToggle.addEventListener('click', async () => {
    if (!audioCtx) {
        await setupAudio();
    }
    
    if (isPlaying) {
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
        toggleText.textContent = 'Listen to the rain';
    } else {
        gainNode.gain.setTargetAtTime(0.5, audioCtx.currentTime, 0.1);
        toggleText.textContent = 'Stop the rain';
    }
    isPlaying = !isPlaying;
});

volumeSlider.addEventListener('input', (e) => {
    if (gainNode) {
        gainNode.gain.setTargetAtTime(e.target.value * 0.5, audioCtx.currentTime, 0.1);
    }
});

const sleepyToggle = document.getElementById('sleepyToggle');
const sleepyText = document.getElementById('sleepyText');
const overlay = document.createElement('div');
overlay.className = 'sleepy-overlay';
document.body.appendChild(overlay);

let isSleepy = false;

sleepyToggle.addEventListener('click', () => {
    isSleepy = !isSleepy;
    if (isSleepy) {
        overlay.classList.add('active');
        sleepyText.textContent = 'Wake up';
    } else {
        overlay.classList.remove('active');
        sleepyText.textContent = 'Go to sleep';
    }
});

// Adjusted the logic above to ensure it toggles correctly each time
// Now it just flips the boolean and updates UI regardless of current state
