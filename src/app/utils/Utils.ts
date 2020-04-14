export class Utils {
    static loadImages(imageUrls: string[]): Promise<HTMLImageElement[]> {
        return new Promise(async resolve => {
            let i = 0;
            const data: HTMLImageElement[] = [];
            const load = async () => {
                const image = await Utils.loadImage(imageUrls[i]);
                data.push(image);
                i++;
                if (i < imageUrls.length) {
                    await load();
                } else {
                    resolve(data);
                }
            };
            await load();
        });
    }

    static loadImage(src): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
        });
    }

    static getRandomColor() {
        const colors = [
            'rgb(229, 45, 45)',
            'rgb(45, 137, 229)',
            'rgb(113, 229, 45)',
            'rgb(174, 0, 255)',
            'rgb(145, 255, 106)',
            'rgb(87,188,255)',
            'rgb(255,108,22)',
            'rgb(255,47,77)',
            'rgb(99,109,205)',
            'rgb(140,193,205)',
            'rgb(17,34,17)',
            '#FA6900',
            '#E0E4CD',
            '#A7DBD7',
            '#aedcb1',
            '#ee4035',
            '#f37736',
            '#fdf498',
            '#7bc043',
            '#0392cf',
            '#96ceb4',
            '#ffeead',
            '#ff6f69',
            '#ffcc5c',
            '#88d8b0'
        ];

        return Utils.getRandomInArray(colors);
    }

    static getRandomInArray(array) {
        // tslint:disable-next-line:no-bitwise
        return array[Math.random() * array.length | 0];
    }

    static getRandomDirection() {
        const directions = [-1, 1];
        // tslint:disable-next-line:no-bitwise
        return directions[Math.random() * directions.length | 0];
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static createButton(text, ctx, x, y, w, h, options = {}, path2D?) {
        const defaultOptions = {
            fontSize: 10,
            color: '#E0E4CD',
            ...options
        };
        ctx.save();
        ctx.fillStyle = defaultOptions.color;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = defaultOptions.color;
        if (path2D) {
            path2D.rect(x, y, w, h);
            ctx.fill(path2D);
        } else {
            ctx.fillRect(x, y, w, h);
        }
        ctx.restore();
        ctx.font = `${defaultOptions.fontSize}px Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText(text, x + w / 2, y + h / 2 + defaultOptions.fontSize / 2);
    }
}
