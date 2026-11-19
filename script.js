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
let isMuted = true;

function initAudio() {
    if (audioCtx) return;
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Using a public high-quality looping rain sound
    const audio = new Audio('https://www.soundjay.com/nature/rain-01.mp3');
    audio.loop = true;
    
    const source = audioCtx.createMediaElementSource(audio);
    const gainNode = audioCtx.createGain();
    
    gainNode.gain.value = volumeControl.value;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    rainSound = { 
        element: audio, 
        gain: gainNode 
    };
    
    audio.play().catch(e => console.log("Audio play blocked by browser"));
}

function toggleAudio() {
    if (!audioCtx) {
        initAudio();
    }
    
    if (isMuted) {
        rainSound.element.play();
        toggleText.innerText = "Mute the rain";
    } else {
        rainSound.element.pause();
        toggleText.innerText = "Listen to the rain";
    }
    isMuted = !isMuted;
}

function updateVolume() {
    if (rainSound) {
        rainSound.gain.gain.value = volumeControl.value;
    }
}

audioToggle.addEventListener('click', toggleAudio);
volumeControl.addEventListener('input', updateVolume);

// Sleepy toggle logic
const sleepyToggle = document.getElementById('sleepyToggle');
const sleepyText = document.getElementById('sleepyText');

sleepyToggle.addEventListener('click', () => {
    document.body.classList.toggle('sleepy-overlay');
    // The body should have the sleepy-overlay as a child or as a class for a separate div
    // Actually, the style.css defines .sleepy-overlay as a fixed overlay
    // Let's add the overlay element dynamically if it's not there
    if (!document.querySelector('.sleepy-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'sleepy-overlay';
        document.body.appendChild(overlay);
    }
    const activeOverlay = document.querySelector('.sleepy-overlay');
    activeOverlay.classList.toggle('active');
    
    if (activeOverlay.classList.contains('active')) {
        sleepyText.innerText = "Wake up";
    } else {
        sleepyText.innerText = "Listen to the dream";
    }
});

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    snowflakesArray.forEach(s => {
        s.update();
        s.draw();
    });
    
    raindropsArray.forEach(r => {
        r.update();
        r.draw();
    });
    
    requestAnimationFrame(animate);
}

animate();