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

init();

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    snowflakes.forEach(s => s.update());
    snowflakes.forEach(s => s.draw());
    
    raindrops.forEach(r => r.update());
    raindrops.forEach(r => r.draw());
    
    // Draw the frog
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(0.1, 0.1);
    ctx.drawImage(frogImg, -250, -250, 500, 500);
    ctx.restore();
    
    // Draw the umbrella
    ctx.save();
    ctx.translate(width / 2, height / 2 - 40);
    ctx.scale(0.1, 0.1);
    ctx.drawImage(umbrellaImg, -250, -250, 500, 500);
    ctx.restore();
    
    requestAnimationFrame(animate);
}

animate();

// Audio Setup
const audioToggle = document.getElementById('audioToggle');
const toggleText = document.getElementById('toggleText');
const volumeSlider = document.getElementById('volumeSlider');
const rainAudio = new Audio('assets/rain_sounds.mp3');
rainAudio.loop = true;

let isPlaying = false;

function toggleAudio() {
    if (isPlaying) {
        rainAudio.pause();
        toggleText.textContent = 'Listen to the rain';
    } else {
        rainAudio.play().catch(e => console.log('Audio playback blocked by browser'));
        toggleText.textContent = 'Pause the rain';
    }
    isPlaying = !isPlaying;
}

audioToggle.addEventListener('click', toggleAudio);

volumeSlider.addEventListener('input', (e) => {
    rainAudio.volume = e.target.value;
});

// Sleepy Toggle
const sleepyToggle = document.getElementById('sleepyToggle');
const sleepyText = document.getElementById('sleepyText');

// Create overlay element dynamically
const overlay = document.createElement('div');
overlay.className = 'sleepy-overlay';
document.body.appendChild(overlay);

let isSleepy = false;

function toggleSleepy() {
    isSleepy = !isSleepy;
    if (isSleepy) {
        sleepyText.textContent = 'Wake up';
        overlay.classList.add('active');
    } else {
        sleepyText.textContent = 'Wake up';
        overlay.classList.remove('active');
    }
    // Correcting logic here to match a simple toggle
    if (isSleepy) {
        sleepyText.textContent = 'Wake up';
    } else {
        sleepyText.textContent = 'Go to sleep';
    }
}

sleepyToggle.addEventListener('click', toggleSleepy);
