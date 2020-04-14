export class Timer {
    static delay(timer) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), timer);
        });
    }

    static requestAnimation(cb) {
        requestAnimationFrame(() => cb());
    }

    static timeAgo(tsp) {
        const current = new Date(tsp);
        const now = new Date();
        const duration = (now.getTime() - current.getTime()) / 1000;
        const isPass = duration > 0;
        const seconds = Math.round(Math.abs(duration));
        const minutes = Math.round(Math.abs(seconds / 60));
        const hours = Math.round(Math.abs(minutes / 60));
        const days = Math.round(Math.abs(hours / 24));
        const months = Math.round(Math.abs(days / 30.416));
        const years = Math.round(Math.abs(days / 365));
        if (Number.isNaN(seconds)) {
            return '';
        } else if (seconds <= 45) {
            return isPass ? 'a few seconds ago' : 'after a few seconds';
        } else if (seconds <= 90) {
            return isPass ? 'a minute ago' : 'after a minute';
        } else if (minutes <= 45) {
            const t = minutes + ' minutes ago';
            return isPass ? t : `after ${minutes} minutes`;
        } else if (minutes <= 90) {
            return isPass ? 'an hour ago' : 'after an hour';
        } else if (hours <= 22) {
            return isPass ? hours + ' hours ago' : `after ${hours} hours`;
        } else if (hours <= 36) {
            return isPass ? 'a day ago' : 'after a day';
        } else if (days <= 25) {
            return isPass ? days + ' days ago' : `after ${days} days`;
        } else if (days <= 45) {
            return isPass ? 'a month ago' : 'after a month';
        } else if (days <= 345) {
            return isPass ? months + ' months ago' : `after ${months} months`;
        } else if (days <= 545) {
            return isPass ? 'a year ago' : 'after a year';
        } else { // (days > 545)
            return isPass ? years + ' years ago' : `after ${years} year`;
        }
    }
}
