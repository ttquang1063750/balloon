import {Utils} from './Utils';

export interface IProperties {
    level?: number;
    totalObject: number;
    score: number[];
    pointRequired: number;
    startTsp?: any;
    endTsp?: any;
}

const MIN_SCORE = 4;
const MAX_SCORE = 50;
const MAX_REQUIRE = 300;
export class GameLevel {
    private level;
    private totalObject;
    private pointRequired;
    private score;
    private startTsp;
    private endTsp;

    constructor() {
        this.reset();
        this.next();
    }

    reset() {
        this.level = 0;
        this.totalObject = 0;
        this.pointRequired = 0;
        this.score = [-MIN_SCORE, MAX_SCORE];
        this.startTsp = Date.now();
        this.endTsp = Date.now();
    }

    next() {
        this.level++;
        this.startTsp = this.endTsp;
        this.endTsp = Date.now();
        this.totalObject = Utils.getRandomInArray(Array.from(Array(15)).map((v, i) => i + 15));
        this.pointRequired = MAX_REQUIRE + (this.level * MAX_REQUIRE);

        let minScore = this.score.shift() - 1;
        let maxScore = this.score.pop() - 1;
        if (Math.abs(minScore) > MAX_SCORE) {
            minScore = -MAX_SCORE;
        }
        if (maxScore < MIN_SCORE) {
            maxScore = MIN_SCORE;
        }
        this.score = [];
        for (let score = minScore; score <= maxScore; score++) {
            if (Math.abs(score) < MIN_SCORE) {
                this.score.push(Utils.getRandomInArray(this.score));
            } else {
                this.score.push(score);
            }
        }
    }

    properties(): IProperties {
        return {
            level: this.level,
            totalObject: this.totalObject,
            score: this.score,
            pointRequired: this.pointRequired,
            startTsp: this.startTsp,
            endTsp: this.endTsp
        };
    }
}
