import * as THREE from 'three';
import Application from '../Application';
import BakedModel from '../Utils/BakedModel';
import Resources from '../Utils/Resources';
import UIEventBus from '../UI/EventBus';

export default class Environment {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;
    bakedModel: BakedModel;
    dayBackground: null;
    nightBackground: THREE.Color;
    dayTint: THREE.Color;
    nightTint: THREE.Color;
    nightMode: boolean;

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;
        this.dayBackground = null;
        this.nightBackground = new THREE.Color(0x020305);
        this.dayTint = new THREE.Color(0xffffff);
        this.nightTint = new THREE.Color(0x1c242c);
        this.nightMode = false;

        this.bakeModel();
        this.setModel();
        this.setTheme(this.nightMode);
        this.bindModeToggle();
    }

    bakeModel() {
        this.bakedModel = new BakedModel(
            this.resources.items.gltfModel.environmentModel,
            this.resources.items.texture.environmentTexture,
            900
        );
    }

    setModel() {
        this.scene.add(this.bakedModel.getModel());
    }

    bindModeToggle() {
        UIEventBus.on('dayNightToggle', (data: { mode: 'day' | 'night' }) => {
            this.nightMode = data && data.mode === 'night';
            this.setTheme(this.nightMode);
        });
    }

    setTheme(isNight: boolean) {
        this.scene.background = isNight
            ? this.nightBackground
            : this.dayBackground;

        if (this.bakedModel && this.bakedModel.material) {
            this.bakedModel.material.color.copy(
                isNight ? this.nightTint : this.dayTint
            );
        }
    }

    update() {}
}
