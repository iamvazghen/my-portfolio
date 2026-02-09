import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import Application from './Application';
import Sizes from './Utils/Sizes';
import Camera from './Camera/Camera';
import UIEventBus from './UI/EventBus';
// @ts-ignore
import screenVert from './Shaders/screen/vertex.glsl';
// @ts-ignore
import screenFrag from './Shaders/screen/fragment.glsl';
import Time from './Utils/Time';

export default class Renderer {
    application: Application;
    sizes: Sizes;
    scene: THREE.Scene;
    cssScene: THREE.Scene;
    time: Time;
    overlay: THREE.Mesh;
    nightOverlay: THREE.Mesh;
    overlayScene: THREE.Scene;
    camera: Camera;
    overlayInstance: THREE.WebGLRenderer;
    instance: THREE.WebGLRenderer;
    cssInstance: CSS3DRenderer;
    raiseExposure: boolean;
    nightTarget: number;
    nightMix: number;
    uniforms: {
        [uniform: string]: THREE.IUniform<any>;
    };

    constructor() {
        this.application = new Application();
        this.time = this.application.time;
        this.sizes = this.application.sizes;
        this.scene = this.application.scene;
        this.cssScene = this.application.cssScene;
        this.overlayScene = this.application.overlayScene;
        this.camera = this.application.camera;
        this.nightTarget = 0;
        this.nightMix = 0;

        this.setInstance();
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });
        // Settings
        // this.instance.physicallyCorrectLights = true;
        this.instance.outputEncoding = THREE.sRGBEncoding;
        // this.instance.toneMapping = THREE.ACESFilmicToneMapping;
        // this.instance.toneMappingExposure = 0.9;
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
        this.instance.setClearColor(0x000000, 0.0);

        // Style
        this.instance.domElement.style.position = 'absolute';
        this.instance.domElement.style.zIndex = '1px';
        this.instance.domElement.style.top = '0px';

        document.querySelector('#webgl')?.appendChild(this.instance.domElement);

        this.overlayInstance = new THREE.WebGLRenderer();
        this.overlayInstance.setSize(this.sizes.width, this.sizes.height);
        this.overlayInstance.domElement.style.position = 'absolute';
        this.overlayInstance.domElement.style.top = '0px';
        this.overlayInstance.domElement.style.mixBlendMode = 'soft-light';
        this.overlayInstance.domElement.style.opacity = '0.12';
        // this.overlayInstance.domElement.style.mixBlendMode = 'luminosity';
        // this.overlayInstance.domElement.style.opacity = '1';
        this.overlayInstance.domElement.style.pointerEvents = 'none';

        document
            .querySelector('#overlay')
            ?.appendChild(this.overlayInstance.domElement);

        this.cssInstance = new CSS3DRenderer();
        this.cssInstance.setSize(this.sizes.width, this.sizes.height);
        this.cssInstance.domElement.style.position = 'absolute';
        this.cssInstance.domElement.style.top = '0px';

        document
            .querySelector('#css')
            ?.appendChild(this.cssInstance.domElement);

        this.uniforms = {
            u_time: { value: 1 },
        };

        this.overlay = new THREE.Mesh(
            new THREE.PlaneGeometry(10000, 10000),
            new THREE.ShaderMaterial({
                vertexShader: screenVert,
                fragmentShader: screenFrag,
                uniforms: this.uniforms,
                depthTest: false,
                depthWrite: false,
            })
        );

        this.overlayScene.add(this.overlay);

        this.nightOverlay = new THREE.Mesh(
            new THREE.PlaneGeometry(10000, 10000),
            new THREE.MeshBasicMaterial({
                color: 0x05070b,
                transparent: true,
                opacity: 0,
                depthTest: false,
                depthWrite: false,
            })
        );
        this.nightOverlay.renderOrder = 5;
        this.overlayScene.add(this.nightOverlay);

        UIEventBus.on(
            'dayNightToggle',
            (data: { mode: 'day' | 'night' }) => {
                this.nightTarget = data && data.mode === 'night' ? 1 : 0;
            }
        );
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));

        this.cssInstance.setSize(this.sizes.width, this.sizes.height);

        this.overlayInstance.setSize(this.sizes.width, this.sizes.height);
        this.overlayInstance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
    }

    update() {
        this.application.camera.instance.updateProjectionMatrix();
        if (this.uniforms) {
            this.uniforms.u_time.value = Math.sin(this.time.current * 0.01);
        }

        this.nightMix += (this.nightTarget - this.nightMix) * 0.08;
        if (this.nightOverlay) {
            this.nightOverlay.position.copy(this.camera.instance.position);
            this.nightOverlay.quaternion.copy(this.camera.instance.quaternion);
            const material = this.nightOverlay
                .material as THREE.MeshBasicMaterial;
            material.opacity = 0.95 * this.nightMix;
        }

        this.instance.render(this.scene, this.camera.instance);
        this.cssInstance.render(this.cssScene, this.camera.instance);
        this.overlayInstance.render(this.overlayScene, this.camera.instance);
        this.overlay.position.copy(this.camera.instance.position);
    }
}
