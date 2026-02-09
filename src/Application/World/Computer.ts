import * as THREE from 'three';
import Application from '../Application';
import BakedModel from '../Utils/BakedModel';
import Resources from '../Utils/Resources';
import UIEventBus from '../UI/EventBus';

export default class Computer {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;
    bakedModel: BakedModel;
    dayTint: THREE.Color;
    nightTint: THREE.Color;
    nightMode: boolean;

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;
        this.dayTint = new THREE.Color(0xffffff);
        this.nightTint = new THREE.Color(0x26303a);
        this.nightMode = false;

        this.bakeModel();
        this.setModel();
        this.applyTheme(this.nightMode);
        this.bindModeToggle();
    }

    bakeModel() {
        this.bakedModel = new BakedModel(
            this.resources.items.gltfModel.computerSetupModel,
            this.resources.items.texture.computerSetupTexture,
            900
        );
    }

    setModel() {
        this.scene.add(this.bakedModel.getModel());
    }

    bindModeToggle() {
        UIEventBus.on('dayNightToggle', (data: { mode: 'day' | 'night' }) => {
            this.nightMode = data && data.mode === 'night';
            this.applyTheme(this.nightMode);
        });
    }

    applyTheme(isNight: boolean) {
        if (this.bakedModel && this.bakedModel.material) {
            this.bakedModel.material.color.copy(
                isNight ? this.nightTint : this.dayTint
            );
        }
    }
}
