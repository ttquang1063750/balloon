import Color from 'color';

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
    baseColor;
    darkColor;
    lightColor;
    path2D;

    constructor(context, centerX, centerY, radius, color) {
        this.context = context;
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.baseColor = new Color(color);
        this.darkColor = this.baseColor.darken(GRADIENT_FACTOR);
        this.lightColor = this.baseColor.lighten(GRADIENT_FACTOR);
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
    }

    hasCollision(x, y) {
        return this.context.isPointInPath(this.path2D, x, y);
    }
}