export class Sound {
    audio: HTMLAudioElement;

    constructor(src) {
        this.audio = document.createElement('audio');
        this.audio.src = src;
    }

    setLoop(isLoop) {
        this.audio.loop = isLoop;
        return this;
    }

    setCurrentTime(currentTime) {
        this.audio.currentTime = currentTime;
        return this;
    }

    play() {
        this.audio.play();
        return this;
    }

    stop() {
        this.audio.pause();
        return this;
    }
}
