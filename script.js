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
    
    snowflakes.forEach(s => {
        s.update();
        s.draw();
    });
    
    raindrops.forEach(r => {
        r.update();
        r.draw();
    });
    
    requestAnimationFrame(animate);
}

init();
animate();

const audioToggle = document.getElementById('audioToggle');
const volumeSlider = document.getElementById('volumeSlider');
const toggleText = document.getElementById('toggleText');

const rainAudio = new Audio('assets/rain_sounds.mp3');
rainAudio.loop = true;

let isPlaying = false;

audioToggle.addEventListener('click', () => {
    if (isPlaying) {
        rainAudio.pause();
        toggleText.textContent = 'Listen to the rain';
    } else {
        rainAudio.play();
        toggleText.textContent = 'Pause the rain';
    }
    isPlaying = !isPlaying;
});

volumeSlider.addEventListener('input', (e) => {
    rainAudio.volume = e.target.value;
});

const sleepyToggle = document.getElementById('sleepyToggle');
const sleepyText = document.getElementById('sleepyText');

let isSleepy = false;
let overlay = document.createElement('div');
overlay.className = 'sleepy-overlay';
document.body.appendChild(overlay);

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