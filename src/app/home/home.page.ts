import {Component, OnInit} from '@angular/core';
import {AlertController, LoadingController} from '@ionic/angular';
import {GameBoard} from '../utils/GameBoard';
import {Preload} from '../utils/Preload';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    constructor(
        private loadingController: LoadingController,
        private alertController: AlertController
    ) {
    }

    async presentLoading() {
        const loading = await this.loadingController.create({
            message: 'Game loading...'
        });
        await loading.present();
        await Preload.load()
            .catch(async error => {
                await loading.dismiss();
                const alertController = await this.alertController.create({
                    message: error.message
                });
                await alertController.present();
            });
        return loading;
    }

    async ngOnInit() {
        const loading = await this.presentLoading();
        const canvasUtil = new GameBoard('canvas');
        canvasUtil.draw();
        await loading.dismiss();
    }
}
