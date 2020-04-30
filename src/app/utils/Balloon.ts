import Color from 'color';
import {Utils} from './Utils';

const KAPPA = (4 * (Math.sqrt(2) - 1)) / 3;
const WIDTH_FACTOR = 0.0333;
const HEIGHT_FACTOR = 0.4;
const TIE_WIDTH_FACTOR = 0.12;
const TIE_HEIGHT_FACTOR = 0.10;
const TIE_CURVE_FACTOR = 0.13;
const GRADIENT_FACTOR = 0.3;
const GRADIENT_CIRCLE_RADIUS = 3;

export class Balloon {
    context;
    centerX;
    centerY;
    radius;
    path2D;
    color;
    isSpecial;
    score;

    constructor(context, centerX, centerY, radius, color, score, isSpecial = false) {
        this.context = context;
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.color = color;
        this.score = score;
        this.isSpecial = isSpecial;
    }

    get darkColor() {
        return this.baseColor.darken(GRADIENT_FACTOR);
    }

    get lightColor() {
        return this.baseColor.lighten(GRADIENT_FACTOR);
    }

    get baseColor() {
        if (this.isSpecial) {
            return new Color(Utils.getRandomColor());
        }
        return new Color(this.color);
    }

    setPosition(centerX, centerY) {
        this.centerX = centerX;
        this.centerY = centerY;
        return this;
    }

    draw() {
        // Prepare constants
        const context = this.context;
        const centerX = this.centerX;
        const centerY = this.centerY;
        const radius = this.radius;

        const handleLength = KAPPA * radius;
        const widthDiff = (radius * WIDTH_FACTOR);
        const heightDiff = (radius * HEIGHT_FACTOR);

        const balloonBottomY = centerY + radius + heightDiff;
        this.path2D = new Path2D();

        // Begin balloon path
        context.beginPath();

        // Top Left Curve
        const topLeftCurveStartX = centerX - radius;
        const topLeftCurveStartY = centerY;

        const topLeftCurveEndX = centerX;
        const topLeftCurveEndY = centerY - radius;

        this.path2D.moveTo(topLeftCurveStartX, topLeftCurveStartY);
        this.path2D.bezierCurveTo(
            topLeftCurveStartX,
            topLeftCurveStartY - handleLength - widthDiff,
            topLeftCurveEndX - handleLength,
            topLeftCurveEndY,
            topLeftCurveEndX,
            topLeftCurveEndY
        );

        // Top Right Curve
        const topRightCurveStartX = centerX;
        const topRightCurveStartY = centerY - radius;

        const topRightCurveEndX = centerX + radius;
        const topRightCurveEndY = centerY;

        this.path2D.bezierCurveTo(
            topRightCurveStartX + handleLength + widthDiff,
            topRightCurveStartY,
            topRightCurveEndX,
            topRightCurveEndY - handleLength,
            topRightCurveEndX,
            topRightCurveEndY
        );

        // Bottom Right Curve
        const bottomRightCurveStartX = centerX + radius;
        const bottomRightCurveStartY = centerY;

        const bottomRightCurveEndX = centerX;
        const bottomRightCurveEndY = balloonBottomY;

        this.path2D.bezierCurveTo(
            bottomRightCurveStartX,
            bottomRightCurveStartY + handleLength,
            bottomRightCurveEndX + handleLength,
            bottomRightCurveEndY,
            bottomRightCurveEndX,
            bottomRightCurveEndY
        );

        // Bottom Left Curve
        const bottomLeftCurveStartX = centerX;
        const bottomLeftCurveStartY = balloonBottomY;

        const bottomLeftCurveEndX = centerX - radius;
        const bottomLeftCurveEndY = centerY;

        this.path2D.bezierCurveTo(
            bottomLeftCurveStartX - handleLength,
            bottomLeftCurveStartY,
            bottomLeftCurveEndX,
            bottomLeftCurveEndY + handleLength,
            bottomLeftCurveEndX,
            bottomLeftCurveEndY
        );

        // Create balloon gradient
        const gradientOffset = (radius / 3);
        const balloonGradient = context
            .createRadialGradient(
                centerX + gradientOffset,
                centerY - gradientOffset,
                GRADIENT_CIRCLE_RADIUS,
                centerX,
                centerY,
                radius + heightDiff
            );
        balloonGradient.addColorStop(0, this.lightColor.hex());
        balloonGradient.addColorStop(0.7, this.darkColor.hex());

        context.fillStyle = balloonGradient;
        context.fill(this.path2D);

        // Create balloon tie
        const halfTieWidth = (radius * TIE_WIDTH_FACTOR) / 2;
        const tieHeight = (radius * TIE_HEIGHT_FACTOR);
        const tieCurveHeight = (radius * TIE_CURVE_FACTOR);

        context.beginPath();
        context.moveTo(centerX - 1, balloonBottomY);
        context.lineTo(centerX - halfTieWidth, balloonBottomY + tieHeight);
        context.quadraticCurveTo(
            centerX,
            balloonBottomY + tieCurveHeight,
            centerX + halfTieWidth,
            balloonBottomY + tieHeight
        );
        context.lineTo(centerX + 1, balloonBottomY);
        context.fill();
        const fontSize = radius + heightDiff - 5;
        this.drawScore(fontSize);
    }

    drawScore(fontSize) {
        this.context.save();
        this.context.font = `${fontSize}px Comic Sans MS`;
        this.context.textAlign = 'center';
        this.context.fillStyle = 'white';
        this.context.textBaseline = 'middle';
        this.context.fillText(this.score, this.centerX, this.centerY + fontSize / 4);
        this.context.restore();
    }

    hasCollision(x, y) {
        return this.context.isPointInPath(this.path2D, x, y);
    }
}
