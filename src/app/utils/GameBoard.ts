import {Balloon} from './Balloon';
import {Timer} from './Timer';
import {Sound} from './Sound';
import {Utils} from './Utils';
import {Ball} from './Ball';
import {Preload} from './Preload';
import {GameLevel} from './GameLevel';

const STATES = {
    INTRO: 'INTRO',
    PLAYING: 'PLAYING',
    STOP: 'STOP',
    RESET: 'RESET',
    GAME_OVER: 'GAME_OVER',
    END: 'END',
    LEVEL_UP: 'LEVEL_UP',
    PAUSED: 'PAUSED'
};

const PADDING = 5;

export class GameBoard {
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
    gameLevel = new GameLevel();
    count = 0;
    score = 0;
    startTsp = 0;
    endTsp = 0;
    state = STATES.INTRO;
    soundPlayer: Sound;
    congratulationSoundPlayer: Sound;
    popSoundPlayer: Sound[];
    objects = [];
    totalSmallBall = 5;
    balls = [];

    constructor(elementId) {
        this.canvas = document.getElementById(elementId);
        if (this.isNotSupportCanvas()) {
            return;
        }
        this.canvas.onselectstart = () => false;
        this.canvas.onclick = (event) => this.onClick(event);
        this.soundPlayer = new Sound('./assets/sound/theme.mp3');
        this.congratulationSoundPlayer = new Sound('./assets/sound/congratulation.mp3');
        this.popSoundPlayer = [
            './assets/sound/clap1.mp3',
            './assets/sound/clap2.mp3'
        ].map(src => {
            return new Sound(src);
        });
        this.resize();
        this.loadBackground();
    }

    isNotSupportCanvas() {
        return !this.canvas.getContext;
    }

    getContext(): CanvasRenderingContext2D | null {
        return this.canvas.getContext('2d');
    }

    onClick(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.state === STATES.LEVEL_UP) {
            return;
        }

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

        if (context.isPointInPath(this.resetButton2D, clientX, clientY) && this.state !== STATES.PAUSED) {
            this.reset();
        }

        if (this.state === STATES.PLAYING) {
            const l = this.objects.length - 1;
            for (let i = l; i >= 0; i--) {
                const o = this.objects[i];
                if (o.canShow && o.balloon.hasCollision(clientX, clientY)) {
                    o.canShow = false;
                    o.wasPopped = true;
                    this.count++;
                    this.createExplore(clientX, clientY, this.totalSmallBall);
                    this.score += o.score;
                    if (this.score < 0) {
                        this.score = 0;
                    }

                    if (this.score >= this.gameLevel.properties().pointRequired) {
                        this.levelUp();
                    } else {
                        let popPlayer: Sound;
                        this.lastBalloonColor = o.rgb;
                        if (o.score < 0) {
                            popPlayer = this.popSoundPlayer[1];
                        } else {
                            popPlayer = this.popSoundPlayer[0];
                        }
                        // const video = document.createElement('video');
                        // video.src = Utils.getRandomInArray(Preload.popVideos);
                        // video.play();
                        // o.pop = video;
                        popPlayer.setCurrentTime(0).play();
                    }
                    return;
                }
            }
        }
    }

    reset() {
        this.state = STATES.RESET;
        this.gameLevel.reset();
    }

    levelUp() {
        this.state = STATES.LEVEL_UP;
        this.objects = [];
        this.soundPlayer.stop();
        this.congratulationSoundPlayer.setCurrentTime(0).setLoop(true).play();
        this.congratulation(0);
    }

    congratulation(times) {
        const delay = 350;
        for (let i = 0; i < 50; i++) {
            const x = Utils.getRandomInt(PADDING, this.width - PADDING);
            const y = Utils.getRandomInt(0, this.height / 3);
            this.createBall(x, y);
        }
        times += delay;
        this.popSoundPlayer[0].setCurrentTime(0).play();
        if (times < delay * 10) {
            setTimeout(() => {
                this.congratulation(times);
            }, times);
        } else {
            this.congratulationSoundPlayer.stop();
            this.soundPlayer.play();
            this.gameLevel.next();
            this.score = 0;
            this.count = 0;
            this.loadBackground();
            this.shuffle();
        }
    }

    createTextCongratulation() {
        const ctx = this.getContext();
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = `${this.height / 6}px Comic Sans MS`;
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, Utils.getRandomColor());
        gradient.addColorStop(0.5, Utils.getRandomColor());
        gradient.addColorStop(1, Utils.getRandomColor());
        // Fill with gradient
        ctx.fillStyle = gradient;
        ctx.fillText('Level Up', this.width / 2, this.height / 2);
        ctx.fillText('Congratulation!', this.width / 2, this.height / 2 + this.height / 6);
        ctx.restore();
    }

    createExplore(clientX, clientY, totalSmallBall) {
        for (let ballIndex = 0; ballIndex < totalSmallBall; ballIndex++) {
            this.createBall(clientX, clientY);
        }
    }

    createBall(clientX, clientY) {
        const context = this.getContext();
        const ball = new Ball(context, clientX, clientY, this.width, this.height, Utils.getRandomColor(), (currentBall) => {
            const indexOfBall = this.balls.indexOf(currentBall);
            this.balls.splice(indexOfBall, 1);
        });
        this.balls.push(ball);
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
        ctx.fillRect((x * 3) + w * 2, y, w, h);

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
        ctx.fillText(`Target: ${this.gameLevel.properties().pointRequired}`, (x * 3) + w * 2.5, y + h / 2 + fontSize / 2);

        ctx.textAlign = 'left';
        ctx.fillStyle = this.timeAgoColor;
        ctx.fillText(`Level: ${this.gameLevel.properties().level} - Played: ${Timer.timeAgo(this.startTsp)}`, x, this.height - 10);
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
        this.play();
        this.startTsp = Date.now();
        this.soundPlayer.setLoop(true).play();
    }

    stopGame() {
        this.soundPlayer.stop().setCurrentTime(0);
        this.endTsp = Date.now();
    }

    clearRect() {
        this.resize();
        const context = this.getContext();
        context.clearRect(0, 0, this.width, this.height);
        // context.globalCompositeOperation = 'hard-light';
    }

    loadBackground() {
        const image = Utils.getRandomInArray(Preload.backgroundImages);
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
        Timer.requestAnimation(() => {
            if (this.state === STATES.RESET || this.state === STATES.INTRO) {
                this.draw();
            }
        });
    }

    play() {
        this.clearRect();
        this.drawScoreAndCount();
        for (const o of this.objects) {
            this.moveX(o);
            this.moveY(o);
            const context = this.getContext();
            if (o.canShow) {
                o.balloon
                    .setPosition(o.centerX, o.centerY)
                    .draw();
            }
            if (o.wasPopped) {
                Utils.drawPop(context, o.pop, o.centerX, o.centerY, o.radius);
                this.speedUp(o);
            }
        }
        this.balls.forEach(ball => ball.update());
        this.renderPauseButton();
        this.renderResetButton();
        if (this.state === STATES.LEVEL_UP) {
            this.createTextCongratulation();
        }

        Timer.requestAnimation(() => {
            if (this.state === STATES.PLAYING || this.state === STATES.LEVEL_UP) {
                this.play();
            } else if (this.state === STATES.RESET) {
                this.stopGame();
                this.draw();
            }
        });
    }

    speedUp(o) {
        const friction = 0.2;
        o.speedX += friction;
        o.speedY += friction;
    }

    moveX(o) {
        if ((o.centerX - o.radius) <= 0) {
            o.centerX = o.radius;
            o.direction = 1;
            this.speedUp(o);
        }

        if ((o.centerX + o.radius) >= this.width) {
            o.centerX = this.width - o.radius;
            o.direction = -1;
            this.speedUp(o);
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
        this.balls = [];
        for (let i = 0; i < this.gameLevel.properties().totalObject; i++) {
            this.objects.push(this.getRandomObject());
        }
        this.state = STATES.PLAYING;
    }

    getRandomObject() {
        const currentLevel = this.gameLevel.properties();
        let score = Utils.getRandomInArray(currentLevel.score);
        const isSpecial = score === currentLevel.score.slice(-1) && (Date.now() - currentLevel.startTsp) >= 30 * 1000;
        if (isSpecial) {
            score = 25;
            console.log('gotcha!!');
        }
        const absScore = Math.abs(score);
        const speedX = Math.ceil(absScore / 2);
        const speedY = Utils.getRandomInt(2, absScore);
        const minRadius = Math.floor(this.width / currentLevel.totalObject);
        const maxRadius = Math.floor(this.width / (currentLevel.totalObject / 2));
        let size = Math.floor(this.width / absScore);
        if (size >= maxRadius) {
            size = maxRadius;
        }

        if (size <= minRadius) {
            size = minRadius;
        }
        const radius = size;
        const centerX = Utils.getRandomInt(radius, this.width - radius);
        const centerY = this.height + radius;
        const direction = Utils.getRandomDirection();
        const wasPopped = false;
        const canShow = true;
        let pop = Utils.getRandomInArray(Preload.popImages);
        let rgb = Utils.getRandomColor();
        if (score < 0) {
            rgb = 'rgb(15,14,34)';
            pop = Utils.getRandomInArray(Preload.popLeuLeuImages);
        }
        const context = this.getContext();
        const balloon = new Balloon(context, centerX, centerY, radius, rgb, isSpecial);
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
