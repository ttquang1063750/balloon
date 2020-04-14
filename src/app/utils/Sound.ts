export class Sound {
    audio: HTMLAudioElement;

    constructor(src) {
        this.audio = document.createElement('audio');
        this.audio.src = src;
        this.audio.setAttribute('preload', 'auto');
        this.audio.setAttribute('controls', 'none');
        this.audio.style.display = 'none';
        document.body.appendChild(this.audio);
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
