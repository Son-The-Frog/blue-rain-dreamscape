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
        this.depth = Math.random();
        this.opacity = (this.depth * 0.4) + 0.2;
        this.shadowBlur = this.depth * 5;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.shadowBlur = this.shadowBlur;
        ctx.shadowColor = 'white';
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
    update() {
        this.y += this.speed;
        this.x += Math.sin(Date.now() * 0.001 + this.depth * 10) * 0.5;
        if (this.y > height) {
            this.reset();
        }
    }
}

const rainCount = 120;
const snowCount = 150;
for (let i = 0; i < rainCount; i++) raindrops.push(new Raindrop());
for (let i = 0; i < snowCount; i++) snowflakes.push(new Snowflake());

function drawFrog() {
    const frogX = width * 0.5;
    const frogY = height * 0.85;
    const frogSize = 60;
    ctx.drawImage(frogImg, frogX - frogSize / 2, frogY - frogSize / 2, frogSize, frogSize);
    
    const umbrellaX = frogX - 10;
    const umbrellaY = frogY - 40;
    const umbrellaSize = 100;
    ctx.drawImage(umbrellaImg, umbrellaX, umbrellaY, umbrellaSize, umbrellaSize);
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
    
    drawFrog();
    
    requestAnimationFrame(animate);
}

animate();

const audioToggle = document.getElementById('audioToggle');
const volumeSlider = document.getElementById('volumeSlider');
const toggleText = document.getElementById('toggleText');

let audioCtx = null;
let rainNoise = null;
let gainNode = null;

function initAudio() {
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

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, audioCtx.currentTime);

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

    rainNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    rainNoise.start();
}

audioToggle.addEventListener('click', () => {
    if (!audioCtx) {
        initAudio();
        toggleText.innerText = 'Stop the rain';
    } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
        toggleText.innerText = 'Stop the rain';
    } else if (audioCtx.state === 'running') {
        audioCtx.suspend();
        toggleText.innerText = 'Listen to the rain';
    }
});

volumeSlider.addEventListener('input', (e) => {
    if (gainNode) {
        gainNode.gain.setValueAtTime(e.target.value, audioCtx.currentTime);
    }
});

const sleepyToggle = document.getElementById('sleepyToggle');
const sleepyText = document.getElementById('sleepyText');
const body = document.body;
let isSleepy = false;

sleepyToggle.addEventListener('click', () => {
    isSleepy = !isSleepy;
    if (isSleepy) {
        body.classList.add('sleepy-overlay');
        // This is a bug: the CSS handles opacity via .active, not just the class
        // I'll fix the logic here to match the CSS
        document.querySelector('.sleepy-overlay') || createSleepyOverlay();
        const overlay = document.querySelector('.sleepy-overlay');
        if(overlay) overlay.classList.add('active');
        sleepyText.innerText = 'Wake up';
    } else {
        const overlay = document.querySelector('.sleepy-overlay');
        if(overlay) overlay.classList.remove('active');
        sleepyText.innerText = 'Go to sleep';
    }
});

function createSleepyOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'sleepy-overlay';
    body.appendChild(overlay);
}

// Small fix for the issue #3: Ensure overlay exists
createSleepyOverlay();
