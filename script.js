const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');
let width, height;
let raindrops = [];
let snowflakes = [];
let mouseX = 0, mouseY = 0;

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
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
    }
}

for (let i = 0; i < 150; i++) {
    raindrops.push(new Raindrop());
}
for (let i = 0; i < 80; i++) {
    snowflakes.push(new Snowflake());
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    snowflakes.forEach(flake => {
        flake.update();
        flake.draw();
    });

    raindrops.forEach(drop => {
        drop.update();
        drop.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// Audio and Sleepy logic from previous steps
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
    filter.frequency.value = 400;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = volumeSlider.value;

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
        gainNode.gain.value = e.target.value;
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
    overlay.classList.toggle('active');
    sleepyText.innerText = isSleepy ? 'Wake up' : 'Fall asleep';
});