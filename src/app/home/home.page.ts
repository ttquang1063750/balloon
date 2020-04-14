import {Component, OnInit} from '@angular/core';
import {LoadingController} from '@ionic/angular';
import {Canvas} from '../utils/Canvas';
import {Utils} from '../utils/Utils';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  popLeuLeuImages: HTMLImageElement[];
  popImages: HTMLImageElement[];
  backgroundImages: HTMLImageElement[];
  constructor(
      private loadingController: LoadingController
  ) {}

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Game loading...'
    });
    await loading.present();

    const popImages = [];
    for (let i = 1; i <= 5; i++) {
      popImages.push(`./assets/images/pop/${i}.png`);
    }

    this.popImages = await Utils.loadImages(popImages);

    const popLeuLeuImages = [];
    for (let i = 1; i <= 6; i++) {
      popLeuLeuImages.push(`./assets/images/pop/leuleu/${i}.png`);
    }
    this.popLeuLeuImages = await Utils.loadImages(popLeuLeuImages);

    const backgrounds = [];
    for (let i = 1; i <= 4; i++) {
      backgrounds.push(`./assets/images/${i}.jpg`);
    }
    this.backgroundImages = await Utils.loadImages(backgrounds);
    return loading;
  }

  async ngOnInit() {
    const loading = await this.presentLoading();
    const canvasUtil = new Canvas('canvas', this.popImages, this.backgroundImages, this.popLeuLeuImages);
    canvasUtil.draw();
    await loading.dismiss();
  }
}
