const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const SIZE = 100;
const OUT_SIZE = 28;

const clearContext = (ctx) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, SIZE, SIZE)
}

const generateCanvas = () => {
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    return { canvas, ctx };
}

const saveCanvas = (canvas, destFile = '../rune-data/out.png') =>{
    const scaledCanvas = createCanvas(OUT_SIZE, OUT_SIZE);
    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCtx.drawImage(canvas, 0, 0, SIZE, SIZE, 0, 0, OUT_SIZE, OUT_SIZE);
    const buffer = scaledCanvas.toBuffer('image/png');
    fs.writeFileSync(destFile, buffer);
}

const generateRuneDataset = (name, canvas, ctx, runeDrawFn) => {
    const outFolder = `../rune-data/${name}/`
    if (!fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder, { recursive: true });
    }
    const N = 10;
    for (let i = 0; i < N; i++) {
        clearContext(ctx);
        runeDrawFn(ctx);
        saveCanvas(canvas, path.join(outFolder, `r_${i}.png`));
    }
}

const drawNoisyPath = (ctx, path) => {
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = Math.random() * 3 + 3;
    const squashX = 1 - Math.random() * 0.2;
    const squashY = 1 - Math.random() * 0.2;
    const skewX = (Math.random() - 0.5) * 0.25;
    const skewY = (Math.random() - 0.5) * 0.25;
    for (let i = 0; i < path.length; i++) {
        let xi = (path[i].x - SIZE / 2) * squashX;
        let yi = (path[i].y - SIZE / 2) * squashY;
        let x0 = (xi + yi * skewX) + SIZE / 2 + (Math.random() - 0.5) * 4;
        let y0 = (yi + xi * skewY) + SIZE / 2 + (Math.random() - 0.5) * 4;
        if (i == 0) {
            ctx.moveTo(x0, y0);
        } else {
            ctx.lineTo(x0, y0);
        }
    }
    ctx.stroke();
}

const addLineToPath = (path, x0, x1, y0, y1) => {
    for (let i = 0; i < 6; i++) {
        const p = i / 5;
        path.push({ 
            x: x1 * p + x0 * (1-p),
            y: y1 * p + y0 * (1-p),
        });
    }
}

const drawFireballRune = (ctx) => {
    const path = [];
    const phase = Math.random() * Math.PI * 2;
    for (let i = 0; i < 29 + Math.random() * 7; i++) {
        const angle = i / 32.0 * Math.PI * 2.0 + phase;
        path.push({
            x: Math.cos(angle) * SIZE * 0.35 + SIZE/2,
            y: Math.sin(angle) * SIZE * 0.35 + SIZE/2,
        });
    }
    drawNoisyPath(ctx, path);
}

const drawMeteorRune = (ctx) => {
    const path = [];
    
    path.push({ x: 12, y: 12 });
    path.push({ x: 22, y: 12 });
    path.push({ x: 32, y: 12 });

    const hookSize = Math.random() * 25 + 15;
    const hookDepth = Math.random() * 10 + 25;
    for (let i = 0; i < 21; i++) {
        const angle = i / 20.0 * Math.PI - Math.PI;
        path.push({
            x: (Math.cos(angle) * hookSize + SIZE/2),
            y: (-Math.sin(angle) * hookDepth + SIZE / 2),
        });
    }
    
    path.push({ x: 100-32, y: 12 });
    path.push({ x: 100-22, y: 12 });
    path.push({ x: 100-12, y: 12 });

    drawNoisyPath(ctx, path);
}

const drawDragonRune = (ctx) => {
    const path = [];
    
    const topLeft = 12 + Math.random() * 8;
    const topRight = 12 + Math.random() * 8;
    const bottom = 7 + Math.random() * 16;
    const top = SIZE/2 - Math.random() * 15 + 8;
    addLineToPath(path, 12, SIZE/2, topLeft, SIZE-bottom);
    addLineToPath(path, SIZE/2, SIZE-12, SIZE-bottom, topRight);
    addLineToPath(path, SIZE-bottom, SIZE/2, topRight, top);
    addLineToPath(path, SIZE/2, 12, top, topLeft);

    drawNoisyPath(ctx, path);
}

const {canvas, ctx} = generateCanvas();
// generateRuneDataset('fireball', canvas, ctx, drawFireballRune);
// generateRuneDataset('meteor', canvas, ctx, drawMeteorRune);
generateRuneDataset('dragon', canvas, ctx, drawDragonRune);
