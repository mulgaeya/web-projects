const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
console.log(battleZonesData)

const image = new Image();
const playerImages = {
    down: new Image(),
    up: new Image(),
    left: new Image(),
    right: new Image()
};

// Load character sprites
playerImages.down.src = './img/DOWN.png';
playerImages.up.src = './img/UP.png';
playerImages.left.src = './img/LEFT.png';
playerImages.right.src = './img/RIGHT.png';

let currentPlayerImage = playerImages.down; // Default to DOWN when idle
const totalFrames = 4;
let frameIndex = 0;
let frameDelay = 25; // Controls animation speed
let frameCount = 0;
let isMoving = false; // Track movement state

let mapX = -100, mapY = -1580;
let playerX = 0, playerY = 0;
let spriteWidth = 0, spriteHeight = 0;
let imagesLoaded = 0;



function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (currentPlayerImage.complete && currentPlayerImage.width > 0) {
        spriteWidth = currentPlayerImage.width / totalFrames;
        spriteHeight = currentPlayerImage.height;

        playerX = (canvas.width / 2) - (spriteWidth / 2);
        playerY = (canvas.height / 2) - (spriteHeight / 2);
    }
}


const collisionsMap = [];
for (let i = 0; i < collision.length; i += 52) {
    collisionsMap.push(collision.slice(i, i + 52));
}

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 52) {
    battleZonesMap.push(battleZonesData.slice(i, i + 52));
}

class Boundary {
    static width = 128; // Original tile size
    static height = 128;

    constructor({ position }) {
        this.position = position;
        this.width = 90; // Shrink hitbox width
        this.height = 90; // Shrink hitbox height
    }

    draw() {
        c.fillStyle = 'rgba(255, 0, 0, 0.5';
        c.fillRect(this.position.mapX + 19, this.position.mapY + 19, this.width, this.height);
    }
}

const boundaries = [];

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1225) {
            boundaries.push(
                new Boundary({
                    position: {
                        mapX: Boundary.width * j,
                        mapY: Boundary.height * i
                    }
                })
            );
        }
    });
});

const battleZones = [];

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1225) {
            battleZones.push(
                new Boundary({
                    position: {
                        mapX: Boundary.width * j,
                        mapY: Boundary.height * i
                    }
                })
            );
        }
    });
});

console.log(battleZones);

function isColliding(nextX, nextY) {
    return boundaries.some(boundary => {
        return (
            nextX < boundary.position.mapX + mapX + boundary.width &&
            nextX + spriteWidth > boundary.position.mapX + mapX &&
            nextY < boundary.position.mapY + mapY + boundary.height &&
            nextY + spriteHeight > boundary.position.mapY + mapY
        );
    });
    
}

function isInBattleZone(nextX, nextY) {
    return battleZones.some(battleZone => {
        return (
            nextX < battleZone.position.mapX + mapX + battleZone.width &&
            nextX + spriteWidth > battleZone.position.mapX + mapX &&
            nextY < battleZone.position.mapY + mapY + battleZone.height &&
            nextY + spriteHeight > battleZone.position.mapY + mapY
        );
    });
}

function drawImages() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(image, mapX, mapY);

    // Animate only when moving
    if (isMoving) {
        if (frameCount % frameDelay === 0) {
            frameIndex = (frameIndex + 1) % totalFrames;
        }
        frameCount++;
    } else {
        frameIndex = 0; // Reset animation when idle
    }

    c.drawImage(
        currentPlayerImage,
        frameIndex * spriteWidth, 0,
        spriteWidth, spriteHeight,
        playerX, playerY,
        spriteWidth, spriteHeight
    );

    
}



image.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 5) {
        resizeCanvas();
        animate();
    }
};

Object.values(playerImages).forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 5) {
            resizeCanvas();
            animate();
        }
    };
});

image.src = './img/FluSim Map.png';

let lastBattleTime = 0;
const battleCooldown = 2000; // 2-second cooldown before another battle
let battleTransitioning = false;
let fadeOpacity = 0; 
let flickerCount = 0;
let flickerInterval;
let finalFadeInterval;
let inBattle = false; // Track if battle scene is active
let overworldAnimationId = requestAnimationFrame(animate);
let battleAnimationId;
const battleBackground = new Image(); // ✅ Define battle background globally
battleBackground.src = './img/battleBackground.png';
const battleSprites = {
    player: new Image(),
    enemy: new Image()
};


battleSprites.enemy.src = './img/influenzaSprite.png'; // Enemy sprite
battleSprites.player.src = './img/charSprite.png'; // Player sprite

// Battle Animation Variables
let battleFrameIndex = 0;
const battleTotalFrames = 4;
const battleFrameDelay = 35;
let battleFrameCount = 0;

function startBattle() {
    document.querySelector(".battle-ui").style.display = "flex";
    document.querySelector(".health-ui").style.display = "flex";
    if (battleTransitioning) return; // Prevent multiple triggers

    battleTransitioning = true;
    fadeOpacity = 1; // Start with black flashes
    flickerCount = 0;

    flickerInterval = setInterval(() => {
        fadeOpacity = fadeOpacity === 1 ? 0 : 1; // Toggle between black and transparent
        flickerCount++;

        if (flickerCount >= 6) { // Adjust the number of flickers
            clearInterval(flickerInterval);

            // Start final fade-to-black
            fadeOpacity = 0;
            finalFadeInterval = setInterval(() => {
                fadeOpacity += 0.05;
                if (fadeOpacity >= 1) {
                    clearInterval(finalFadeInterval);
                    
                    console.log("⚔️ Battle transition complete! Switching to battle scene...");
                    
                    // ✅ Stop the overworld animation
                    cancelAnimationFrame(overworldAnimationId);

                    // ✅ Start the battle scene AFTER the fade completes
                    startBattleAnimation();
                }
            }, 50);
        }
    }, 100); // Flicker speed
}

    

function startBattleAnimation() {
    function battleAnimate() {
        battleAnimationId = requestAnimationFrame(battleAnimate);
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.drawImage(battleBackground, 0, 0, canvas.width, canvas.height);

        if (battleFrameCount % battleFrameDelay === 0) {
            battleFrameIndex = (battleFrameIndex + 1) % battleTotalFrames;
        }
        battleFrameCount++;

        let playerWidth = battleSprites.player.width / battleTotalFrames;
        let playerHeight = battleSprites.player.height;
        let playerX = canvas.width * 0.1;
        let playerY = canvas.height * 0.6;

        c.drawImage(
            battleSprites.player,
            battleFrameIndex * playerWidth, 0,
            playerWidth, playerHeight,
            playerX, playerY,
            playerWidth * 2, playerHeight * 2
        );

        let enemyWidth = battleSprites.enemy.width / battleTotalFrames;
        let enemyHeight = battleSprites.enemy.height;
        let enemyX = canvas.width * 0.7;
        let enemyY = canvas.height * 0.1;

        c.drawImage(
            battleSprites.enemy,
            battleFrameIndex * enemyWidth, 0,
            enemyWidth, enemyHeight,
            enemyX, enemyY,
            enemyWidth * 2, enemyHeight * 2
        );
    }
    battleAnimationId = requestAnimationFrame(battleAnimate);
}

function endBattle() {
    document.querySelector(".battle-ui").style.display = "none";
    document.querySelector(".health-ui").style.display = "none";
    cancelAnimationFrame(battleAnimationId); // 2️⃣ Stop the battle animation
    overworldAnimationId = requestAnimationFrame(animate); // Resume overworld animation
}



function battleAnimate() {
    if (!inBattle) return; // Stop if the battle ends

    window.requestAnimationFrame(battleAnimate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the battle UI, background, and characters here
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
    
    //c.fillStyle = "white";
    //c.font = "30px Arial";
    //c.fillText("Battle Mode!", canvas.width / 2 - 100, canvas.height / 2);
}

function animate() {
    if (inBattle) return;

    window.requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(image, mapX, mapY);

    boundaries.forEach(boundary => boundary.draw());
    battleZones.forEach(battleZone => battleZone.draw());
    drawImages();

    // ✅ Draw fade-to-black effect if transitioning
    if (battleTransitioning) {
        c.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
        c.fillRect(0, 0, canvas.width, canvas.height);
    }
}

window.addEventListener('keydown', (e) => {
    if (battleTransitioning) return; 
    let nextMapX = mapX;
    let nextMapY = mapY;
    let nextPlayerX = playerX;
    let nextPlayerY = playerY;

    isMoving = true; // Player is moving
    

    switch (e.key) {
        case 'w':
            currentPlayerImage = playerImages.up;
            nextMapY += 10;
            nextPlayerY -= 10;
            break;
        case 'a':
            currentPlayerImage = playerImages.left;
            nextMapX += 10;
            nextPlayerX -= 10;
            break;
        case 's':
            currentPlayerImage = playerImages.down;
            nextMapY -= 10;
            nextPlayerY += 10;
            break;
        case 'd':
            currentPlayerImage = playerImages.right;
            nextMapX -= 10;
            nextPlayerX += 10;
            break;
    }

    // ✅ Check collision before updating position
    if (!isColliding(nextPlayerX, nextPlayerY)) {
        mapX = nextMapX;
        mapY = nextMapY;
    }
    if (
        isInBattleZone(nextPlayerX, nextPlayerY) &&
        Math.random() < 0.02 && //2% chance
        Date.now() - lastBattleTime > battleCooldown
    ) {
        startBattle();
    }
});

window.addEventListener('keyup', () => {
    isMoving = false;
    currentPlayerImage = playerImages.down; // Reset to default when idle
});

animate();
window.addEventListener('resize', resizeCanvas);
