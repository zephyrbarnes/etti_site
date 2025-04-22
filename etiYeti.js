document.addEventListener('DOMContentLoaded', () => {
const cv = document.getElementById('etiYeti');
const ct = cv.getContext("2d");
let ch = cv.height = window.innerHeight;
let cw = cv.width = window.innerWidth;

let snowflakes = [];
let snowball = { x: cw / 2, y: ch / 2, radius: 10, snow: 0 };
let mouse = { x: 0, y: 0, isDown: false };

function createSnowflake() {
    return {
        x: Math.random() * cw, y: -10,
        radius: 2 + Math.random(),
        speed: 1 + Math.random()
    };
}

function updateSnowflakes() {
    snowflakes.forEach((snowflake, index) => {
        snowflake.y += snowflake.speed;
        if (snowflake.y > ch) {
            snowflakes.splice(index, 1);
        }
    });
    if (Math.random() < 0.1) {
        const newSnowflake = createSnowflake();
        snowflakes.push(newSnowflake);
    }
}

function drawSnowflakes() {
    ct.clearRect(0, 0, cw, ch);
    snowflakes.forEach(snowflake => {
        ct.beginPath();
        ct.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
        ct.fillStyle = 'white';
        ct.fill();
    });
}

function checkCollision() {
    snowflakes.forEach((snowflake, index) => {
        const dx = snowflake.x - mouse.x;
        const dy = snowflake.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < snowflake.radius) {
            snowflakes.splice(index, 1);
            snowball.radius += 1;
            snowball.snow += 1;
        }
    });
}

function drawSnowball() {
    ct.beginPath();
    ct.arc(snowball.x, snowball.y, snowball.radius, 0, Math.PI * 2);
    ct.fillStyle = 'white';
    ct.fill();
}

function collectSnow() {
    if (mouse.isDown) {
        snowball.snow += Math.floor(snowball.radius / 2);
        snowball.radius = 10;
    }
}

cv.addEventListener('mousemove', (e) => {
    const rect = cv.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

cv.addEventListener('mousedown', () => {
    mouse.isDown = true;
    collectSnow();
});

cv.addEventListener('mouseup', () => {
    mouse.isDown = false;
});

function gameLoop() {
    updateSnowflakes();
    checkCollision();
    drawSnowflakes();
    drawSnowball();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    cw = cv.width = window.innerWidth;
    ch = cv.height = window.innerHeight;
    camera.updateProjectionMatrix();
}, false);

// Start the game loop
gameLoop();
});