const canvas = document.querySelector('canvas');
const c = canvas.getContext ('2d');

const image = new Image();
const playerImage = new Image();
let imagesLoaded = 0;

const totalFrames = 4;

let mapX = -100, mapY = -1580;
let playerX = 0, playerY = 0;
let spriteWidth = 0, spriteHeight = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (playerImage.complete && playerImage.width > 0) {
        spriteWidth = playerImage.width / totalFrames;
        spriteHeight = playerImage.height; 

        playerX = (canvas.width /2) - (spriteWidth / 2);
        playerY = (canvas.height / 2) - (spriteHeight / 2);
    }
}





function drawImages() {
    c.fillStyle = 'white';
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.drawImage(image, mapX, mapY);

    const spriteWidth = playerImage.width / totalFrames;
    const spriteHeight = playerImage.height;
     c.drawImage(
        playerImage,
        0,
        0,
        spriteWidth,
        spriteHeight, 
        playerX,
        playerY,
        spriteWidth,
        spriteHeight
    );
}

function animate() {
    requestAnimationFrame(animate);
    drawImages();
}

//increment counter when each image loads

image.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        resizeCanvas();
        drawImages();
    }
};

playerImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 2) 
        resizeCanvas();
        drawImages();
};




image.src = './img/FluSim Map.png'
playerImage.src = './img/DOWN.png'

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            mapY += 10;
            break;
        case 'a':
            mapX += 10;
            break;
        case 's':
            mapY -= 10;
            break;
        case 'd':
            mapX -= 10; 
            break;
    }
});

animate();
window.addEventListener('resize', resizeCanvas);