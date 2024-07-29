const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

const gridSize = 10;
let run = true;

let shadesWall = [
    "hsl(0,0%,0%)",
    "hsl(0,0%,20%)",
    "hsl(0,0%,25%)",
    "hsl(0,0%,30%)",
    "hsl(0,0%,35%)",
    "hsl(0,0%,40%)",
    "hsl(0,0%,55%)",
    "hsl(0,0%,60%)",
];
let shadesFloor = [
    "hsl(0,100%,10%)",
    "hsl(0,100%,15%)",
    "hsl(0,100%,20%)",
    "hsl(0,100%,25%)",
    "hsl(0,100%,30%)",
    "hsl(0,100%,35%)",
    "hsl(0,100%,40%)",
    "hsl(0,100%,45%)",
    "hsl(0,100%,50%)",
    "hsl(0,100%,55%)",
];

let gridWidth = canvas.width / gridSize;
let gridHeight = canvas.height / gridSize;

let grid = Array(gridHeight * gridWidth).fill(0);

let mapHeight = 16;
let mapWidth = 16;

let mapSize = 10;

let depth = 16;

let playerX = 4;
let playerY = 14;
let playerA = Math.PI;

let playerSize = 1;

let FOV = Math.PI / 4;

let map = "";
map += "################";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "#..........#####";
map += "#..............#";
map += "###............#";
map += "###............#";
map += "###............#";
map += "###............#";
map += "###............#";
map += "#..............#";
map += "#.........#....#";
map += "#.........#....#";
map += "#.........#....#";
map += "################";

let keys = new Set();

let speed = 0.1;

window.addEventListener("keydown", (e) => {
    keys.add(e.key);
});

window.addEventListener("keyup", (e) => {
    keys.delete(e.key);
});

function update() {
    if (keys.has("a")) {
        playerA += 0.04;
    }
    if (keys.has("d")) {
        playerA -= 0.04;
    }
    if (keys.has("w")) {
        playerX += Math.sin(playerA) * speed;
        playerY += Math.cos(playerA) * speed;
        let offSetX = Math.sin(playerA) * 0.5;
        let offSetY = Math.cos(playerA) * 0.5;
        
        if (map[Math.floor(playerY + offSetY) * mapWidth + Math.floor(playerX + offSetX)] === "#") {
            playerX -= Math.sin(playerA) * speed;
            playerY -= Math.cos(playerA) * speed;
        }
    }
    if (keys.has("s")) {
        playerX -= Math.sin(playerA) * speed;
        playerY -= Math.cos(playerA) * speed;
        let offSetX = -Math.sin(playerA) * 0.5;
        let offSetY = -Math.cos(playerA) * 0.5;

        if (map[Math.floor(playerY + offSetY) * mapWidth + Math.floor(playerX + offSetX)] === "#") {
            playerX += Math.sin(playerA) * speed;
            playerY += Math.cos(playerA) * speed;
        }
    }

    for (let x = 0; x < gridWidth; x++) {
        let rayAngle = playerA + FOV / 2 - (x / gridWidth) * FOV;

        let distanceToWall = 0;
        let hitWall = false;
        let boundry = false;

        let eyeX = Math.sin(rayAngle);
        let eyeY = Math.cos(rayAngle);

        while (!hitWall && distanceToWall < depth) {
            distanceToWall += 0.1;
            let testX = Math.floor(playerX + eyeX * distanceToWall);
            let testY = Math.floor(playerY + eyeY * distanceToWall);

            // Test if ray is out of bounds
            if (testX < 0 || testX >= mapWidth || testY < 0 || testY >= mapHeight) {
                hitWall = true;
                distanceToWall = depth;
            } else {
                // Ray is in bounds so test to see if ray cell is a wall block
                if (map[testY * mapWidth + testX] === "#") {
                    hitWall = true;

                    p = []; // distance, dot

                    for (let tx = 0; tx < 2; tx++) {
                        for (let ty = 0; ty < 2; ty++) {
                            let vy = testY + ty - playerY;
                            let vx = testX + tx - playerX;
                            let d = Math.sqrt(vx * vx + vy * vy);
                            let dot = (eyeX * vx) / d + (eyeY * vy) / d;
                            p.push([d, dot]);
                        }
                    }

                    p.sort((a, b) => a[0] - b[0]);

                    let bound = 0.01;
                    if (Math.acos(p[0][1]) < bound) {
                        boundry = true;
                    }
                    if (Math.acos(p[1][1]) < bound) {
                        boundry = true;
                    }
                }
            }
        }

        let ceiling = gridHeight / 2 - gridHeight / distanceToWall;
        let floor = gridHeight - ceiling;

        for (let y = 0; y < gridHeight; y++) {
            if (y <= ceiling) {
                let div = ceiling / 10;
                let l = shadesWall.length;
                if (y <= div * 1) {
                    grid[y * gridWidth + x] = l + 9;
                } else if (y <= div * 2) {
                    grid[y * gridWidth + x] = l + 8;
                } else if (y <= div * 3) {
                    grid[y * gridWidth + x] = l + 7;
                } else if (y <= div * 4) {
                    grid[y * gridWidth + x] = l + 6;
                } else if (y <= div * 5) {
                    grid[y * gridWidth + x] = l + 5;
                } else if (y <= div * 6) {
                    grid[y * gridWidth + x] = l + 4;
                } else if (y <= div * 7) {
                    grid[y * gridWidth + x] = l + 3;
                } else if (y <= div * 8) {
                    grid[y * gridWidth + x] = l + 2;
                } else if (y <= div * 9) {
                    grid[y * gridWidth + x] = l + 1;
                } else if (y <= div * 10) {
                    grid[y * gridWidth + x] = l + 0;
                }
            } else if (y > ceiling && y <= floor) {
                if (distanceToWall <= depth / 7) {
                    grid[y * gridWidth + x] = 7;
                } else if (distanceToWall <= depth / 6) {
                    grid[y * gridWidth + x] = 6;
                } else if (distanceToWall <= depth / 5) {
                    grid[y * gridWidth + x] = 5;
                } else if (distanceToWall <= depth / 4) {
                    grid[y * gridWidth + x] = 4;
                } else if (distanceToWall <= depth / 3) {
                    grid[y * gridWidth + x] = 3;
                } else if (distanceToWall <= depth / 2) {
                    grid[y * gridWidth + x] = 2;
                } else if (distanceToWall <= depth) {
                    grid[y * gridWidth + x] = 1;
                }

                if (boundry) {
                    grid[y * gridWidth + x] = 0;
                }
            } else {
                // let b = 1 - (y - gridWidth/2) / gridWidth/2;
                let div = ceiling / 10;
                let l = shadesWall.length;
                if (y <= floor + div * 1) {
                    grid[y * gridWidth + x] = l + 0;
                } else if (y <= floor + div * 2) {
                    grid[y * gridWidth + x] = l + 1;
                } else if (y <= floor + div * 3) {
                    grid[y * gridWidth + x] = l + 2;
                } else if (y <= floor + div * 4) {
                    grid[y * gridWidth + x] = l + 3;
                } else if (y <= floor + div * 5) {
                    grid[y * gridWidth + x] = l + 4;
                } else if (y <= floor + div * 6) {
                    grid[y * gridWidth + x] = l + 5;
                } else if (y <= floor + div * 7) {
                    grid[y * gridWidth + x] = l + 6;
                } else if (y <= floor + div * 8) {
                    grid[y * gridWidth + x] = l + 7;
                } else if (y <= floor + div * 9) {
                    grid[y * gridWidth + x] = l + 8;
                } else if (y <= floor + div * 10) {
                    grid[y * gridWidth + x] = l + 9;
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw screen: first person view
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            let n = grid[y * gridWidth + x];
            if (n < shadesWall.length) {
                ctx.fillStyle = shadesWall[n];
            } else if (n < shadesWall.length + shadesFloor.length) {
                ctx.fillStyle = shadesFloor[n - shadesWall.length];
            }
            ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
        }
    }

    // Draw mini map
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let n = map[y * mapWidth + x];
            switch (n) {
                case "#":
                    ctx.fillStyle = "#000000";
                    break;
                case ".":
                    ctx.fillStyle = "#ffffff";
                    break;
            }
            ctx.fillRect(x * mapSize, y * mapSize, mapSize, mapSize);
        }
    }

    // draw player on mini map
    ctx.save();
    ctx.translate(playerX * mapSize, playerY * mapSize);
    ctx.rotate(-playerA);
    ctx.fillStyle = "#0000ff";
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "#ffff0077";
    ctx.arc(0, 0, 50, (Math.PI * 3) / 8, (Math.PI * 5) / 8);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();
}

const FPS = 20;
const frameTime = 1000 / FPS;

let lastRun = 0;

function main(time) {
    requestAnimationFrame(main);
    if (run) {
        draw();
        update();
    }

    // let timeElapsed = time - lastRun;
    // console.log(timeElapsed);
    // lastRun = time;

    // if (timeElapsed >= frameTime) {
    //     lastRun = time - (timeElapsed % frameTime);
    //     draw()
    //     update();
    // }
}

requestAnimationFrame(main);
