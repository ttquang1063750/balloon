import {Utils} from './Utils';

export class Preload {
    static backgroundAudio: string;
    static popAudios: string[] = [];
    static popImages: HTMLImageElement[] = [];
    static popLeuLeuImages: HTMLImageElement[] = [];
    static backgroundImages: HTMLImageElement[] = [];

    static async loadPopImages() {
        const popImages = [];
        for (let i = 1; i <= 5; i++) {
            popImages.push(`./assets/images/pop/${i}.png`);
        }

        Preload.popImages = await Utils.loadImages(popImages);
    }

    static async loadPopLeuLeuImages() {
        const popLeuLeuImages = [];
        for (let i = 1; i <= 6; i++) {
            popLeuLeuImages.push(`./assets/images/pop/leuleu/${i}.png`);
        }
        Preload.popLeuLeuImages = await Utils.loadImages(popLeuLeuImages);
    }

    static async loadBackgroundImages() {
        const backgrounds = [];
        for (let i = 1; i <= 4; i++) {
            backgrounds.push(`./assets/images/${i}.jpg`);
        }
        Preload.backgroundImages = await Utils.loadImages(backgrounds);
    }

    static async loadPopAudios() {
        Preload.popAudios = await Utils.loadResources([
            './assets/sound/clap1.mp3',
            './assets/sound/clap2.mp3'
        ]);
    }

    static async loadBackgroundAudio() {
        Preload.backgroundAudio = await Utils.loadResource('./assets/sound/theme.mp3');
    }

    static async load() {
        await Preload.loadPopImages();
        await Preload.loadPopLeuLeuImages();
        await Preload.loadBackgroundImages();
        // await Preload.loadPopAudios();
        // await Preload.loadBackgroundAudio();
    }
}
