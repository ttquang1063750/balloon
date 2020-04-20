import {Utils} from './Utils';

const SHAPE = {
    OVAL: 'OVAL',
    CIRCLE: 'CIRCLE',
    SQUARE: 'SQUARE',
    TRIANGLE: 'TRIANGLE',
    START_01: 'START_01',
    START_02: 'START_02',
    START_03: 'START_03',
    START_04: 'START_04',
};

export class Ball {
    x;
    y;
    dx = Utils.getRandomInt(-3, 3);
    dy = Utils.getRandomInt(-2, 2);
    radius = Utils.getRandomInt(5, 30);
    frameWidth;
    frameHeight;
    color;
    ctx;
    opacity = 1;
    cb;

    constructor(ctx: CanvasRenderingContext2D, x, y, frameWidth, frameHeight, color, cb) {
        const dimension = this.radius * 2;
        this.ctx = ctx;
        this.x = x + Utils.getRandomInt(-dimension, dimension);
        this.y = y + Utils.getRandomInt(-dimension, dimension);
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.color = color;
        this.cb = cb;
    }

    draw() {
        this.ctx.save();
        this.ctx.strokeStyle = 'transparent';
        this.ctx.beginPath();
        this.shapes();
        this.ctx.fillStyle = this.color;
        this.ctx.globalAlpha = this.opacity;
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    }

    shapes() {
        const shape = Utils.getRandomInArray(Object.keys(SHAPE));
        switch (shape) {
            case SHAPE.OVAL:
                this.drawOval(this.x, this.y, this.radius);
                break;

            case SHAPE.CIRCLE:
                this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                break;

            case SHAPE.SQUARE:
                this.ctx.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
                break;

            case SHAPE.START_01:
                this.drawStar(this.x, this.y, 5, this.radius * 2, this.radius);
                break;

            case SHAPE.START_02:
                this.drawStar(this.x, this.y, 6, this.radius * 2, this.radius);
                break;

            case SHAPE.START_03:
                this.drawStar(this.x, this.y, 12, this.radius * 2, this.radius);
                break;

            case SHAPE.START_04:
                this.drawStar(this.x, this.y, 20, this.radius * 2, this.radius);
                break;

            case SHAPE.TRIANGLE:
                this.drawTriangle(this.x, this.y, this.radius);
                break;
        }
    }

    drawTriangle(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x - radius, y - radius);
        this.ctx.lineTo(x - radius, y + (radius * 2));
        this.ctx.lineTo(x + (radius * 2), y + (radius * 2));
        this.ctx.lineTo(x - radius, y - radius);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawOval(x, y, radius) {
        this.ctx.scale(2, 1);
        this.ctx.arc(x / 2, y, radius, 0, Math.PI * 2, false);
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        const step = Math.PI / spikes;
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    update() {
        const fromGravity = Utils.fromGravity(
            this.x,
            this.y,
            this.dx,
            this.dy,
            this.radius,
            this.frameWidth,
            this.frameHeight,
            () => {
            },
            () => {
                this.opacity -= 0.03;
            }
        );
        this.x = fromGravity.x;
        this.y = fromGravity.y;
        this.dx = fromGravity.dx;
        this.dy = fromGravity.dy;
        this.draw();

        if (this.opacity < 0) {
            this.opacity = 0;
            this.cb(this);
        }
    }
}
