import {Balloon} from './Balloon';
import {Timer} from './Timer';
import {Sound} from './Sound';
import {Utils} from './Utils';

const STATES = {
    INTRO: 'INTRO',
    PLAYING: 'PLAYING',
    STOP: 'STOP',
    RESET: 'RESET',
    GAME_OVER: 'GAME_OVER',
    END: 'END',
    PAUSED: 'PAUSED'
};

const PADDING = 5;

export class Canvas {
    canvas;
    startButton2D = null;
    resetButton2D = null;
    pauseButton2D = null;
    lastBalloonColor = Utils.getRandomColor();
    timeAgoColor = Utils.getRandomColor();
    btnStartColor = Utils.getRandomColor();
    btnPauseColor = Utils.getRandomColor();
    btnCountColor = Utils.getRandomColor();
    btnScoreColor = Utils.getRandomColor();
    count = 0;
    score = 0;
    startTsp = 0;
    endTsp = 0;
    state = STATES.INTRO;
    backgroundSound: Sound;
    playSound: Sound;
    objects = [];
    popImages: HTMLImageElement[];
    backgroundImages: HTMLImageElement[];
    popLeuLeuImages: HTMLImageElement[];

    constructor(elementId, popImages: HTMLImageElement[], backgroundImages: HTMLImageElement[], popLeuLeuImages: HTMLImageElement[]) {
        this.canvas = document.getElementById(elementId);
        if (this.isNotSupportCanvas()) {
            return;
        }
        this.popImages = popImages;
        this.backgroundImages = backgroundImages;
        this.popLeuLeuImages = popLeuLeuImages;
        this.canvas.onselectstart = () => false;
        this.canvas.onclick = (event) => this.onClick(event);
        this.backgroundSound = new Sound('./assets/theme.mp3');
        this.playSound = new Sound('./assets/pop.mp3');
        this.resize();
        this.loadBackground();
    }

    isNotSupportCanvas() {
        return !this.canvas.getContext;
    }

    getContext() {
        return this.canvas.getContext('2d');
    }

    onClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const {clientX, clientY} = event;
        if (this.state === STATES.INTRO || this.state === STATES.RESET) {
            this.onClickWhileIntro(clientX, clientY);
            return;
        }

        this.onClickWhilePlaying(clientX, clientY);
    }

    onClickWhileIntro(clientX, clientY) {
        const context = this.getContext();
        if (context.isPointInPath(this.startButton2D, clientX, clientY)) {
            return this.startGame();
        }
    }

    onClickWhilePlaying(clientX, clientY) {
        const context = this.getContext();
        if (context.isPointInPath(this.pauseButton2D, clientX, clientY)) {
            this.state = STATES.PLAYING === this.state ? STATES.PAUSED : STATES.PLAYING;
            // Need play to fetch the new text
            this.play();
        }

        if (context.isPointInPath(this.resetButton2D, clientX, clientY)) {
            this.state = STATES.RESET;
        }

        if (this.state === STATES.PLAYING) {
            const l = this.objects.length - 1;
            for (let i = l; i >= 0; i--) {
                const o = this.objects[i];
                if (o.canShow && o.balloon.hasCollision(clientX, clientY)) {
                    o.canShow = false;
                    o.wasPopped = true;
                    this.count++;
                    this.score += o.score;
                    if (this.score < 0) {
                        this.score = 0;
                    }
                    this.lastBalloonColor = o.rgb;
                    return this.playSound.setCurrentTime(0).play();
                }
            }
        }
    }

    drawScoreAndCount() {
        const ctx = this.getContext();
        const w = 100;
        const h = 50;
        const x = PADDING;
        const y = PADDING;
        const fontSize = 15;
        const balloonRadius = 15;
        ctx.save();
        ctx.fillStyle = this.btnCountColor;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.btnCountColor;
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = this.btnScoreColor;
        ctx.shadowColor = this.btnScoreColor;
        ctx.fillRect((x * 2) + w, y, w, h);

        ctx.restore();

        ctx.font = `${fontSize}px Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText(`${this.count}`, balloonRadius + w / 2, y + h / 2 + fontSize / 2);
        ctx.save();
        const balloon = new Balloon(ctx, (x * 2) + balloonRadius, h / 2, balloonRadius, this.lastBalloonColor);
        balloon.draw();
        ctx.restore();

        ctx.fillText(`score: ${this.score}`, (x * 2) + w * 1.5, y + h / 2 + fontSize / 2);
        ctx.textAlign = 'left';
        ctx.fillStyle = this.timeAgoColor;
        ctx.fillText(Timer.timeAgo(this.startTsp), x, this.height - 10);
    }

    renderStartButton() {
        const ctx = this.getContext();
        const w = 200;
        const h = 80;
        const x = (this.width - w) / 2;
        const y = (this.height - h) / 2;
        const fontSize = 35;
        this.startButton2D = new Path2D();
        Utils.createButton('START', ctx, x, y, w, h, {fontSize, color: this.btnStartColor}, this.startButton2D);
    }

    renderPauseButton() {
        const ctx = this.getContext();
        const w = 100;
        const h = 50;
        const x = this.width - w - PADDING;
        const y = this.height - h - PADDING;
        const fontSize = 15;
        this.pauseButton2D = new Path2D();
        Utils.createButton(this.state, ctx, x, y, w, h, {fontSize, color: this.btnPauseColor}, this.pauseButton2D);
    }

    renderResetButton() {
        const ctx = this.getContext();
        const w = 100;
        const h = 50;
        const x = this.width - w - PADDING;
        const y = PADDING;
        const fontSize = 15;
        this.resetButton2D = new Path2D();
        Utils.createButton('reset', ctx, x, y, w, h, {fontSize}, this.resetButton2D);
    }

    startGame() {
        this.loadBackground();
        this.shuffle();
        this.state = STATES.PLAYING;
        this.play();
        this.startTsp = Date.now();
        this.backgroundSound.setLoop(true).play();
    }

    stopGame() {
        this.backgroundSound.stop().setCurrentTime(0);
        this.playSound.stop().setCurrentTime(0);
        this.endTsp = Date.now();
    }

    clearRect() {
        this.resize();
        const context = this.getContext();
        context.clearRect(0, 0, this.width, this.height);
        // context.globalCompositeOperation = 'hard-light';
    }

    loadBackground() {
        const image = Utils.getRandomInArray(this.backgroundImages);
        this.canvas.style.backgroundImage = `url(${image.src})`;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

    draw() {
        this.clearRect();
        this.renderStartButton();
    }

    play() {
        this.clearRect();
        this.drawScoreAndCount();
        for (const o of this.objects) {
            this.moveX(o);
            this.moveY(o);
            const context = this.getContext();
            if (o.canShow) {
                o.balloon = new Balloon(context, o.centerX, o.centerY, o.radius, o.rgb);
                o.balloon.draw();
            }
            if (o.wasPopped) {
                context.drawImage(o.pop, o.centerX - o.radius, o.centerY - o.radius, o.radius * 2, o.radius * 2);
            }
        }
        this.renderPauseButton();
        this.renderResetButton();

        Timer.requestAnimation(() => {
            if (this.state === STATES.PLAYING) {
                this.play();
            } else if (this.state === STATES.RESET) {
                this.stopGame();
                this.draw();
            }
        });
    }

    moveX(o) {
        if ((o.centerX - o.radius) <= 0) {
            o.centerX = o.radius;
            o.direction = 1;
        }

        if ((o.centerX + o.radius) >= this.width) {
            o.centerX = this.width - o.radius;
            o.direction = -1;
        }
        o.centerX += (o.speedX * o.direction);
    }

    moveY(o) {
        if ((o.centerY + (o.radius * 2)) <= 0) {
            const object = this.getRandomObject();
            const keys = Object.keys(object);
            for (const key of keys) {
                o[key] = object[key];
            }
        }

        o.centerY -= o.speedY;
    }

    shuffle() {
        this.objects = [];
        for (let i = 0; i < 20; i++) {
            this.objects.push(this.getRandomObject());
        }
    }

    getRandomObject() {
        const radius = Utils.getRandomInt(50, 80);
        const centerX = Utils.getRandomInt(radius, this.width - radius);
        const centerY = this.height + radius;
        const speedX = Utils.getRandomInt(2, 5);
        const speedY = Utils.getRandomInt(2, 5);
        const direction = Utils.getRandomDirection();
        const wasPopped = false;
        const canShow = true;
        const balloon = null;
        const score = Utils.getRandomInArray([-5, -3, -1, 2, 4, 5, 7, 12, 15, 17, 19, 20]);
        let pop = Utils.getRandomInArray(this.popImages);
        let rgb = Utils.getRandomColor();
        if (score < 0) {
            rgb = 'rgb(15,14,34)';
            pop = Utils.getRandomInArray(this.popLeuLeuImages);
        }
        return {
            centerX,
            centerY,
            speedX,
            speedY,
            direction,
            radius,
            rgb,
            balloon,
            score,
            canShow,
            wasPopped,
            pop
        };
    }
}
