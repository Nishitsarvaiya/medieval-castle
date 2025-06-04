import GUI from 'lil-gui';
import {
	AmbientLight,
	DirectionalLight,
	FogExp2,
	PCFSoftShadowMap,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	WebGLRenderer,
	LoadingManager,
} from 'three';

import { OrbitControls, Sky } from 'three/examples/jsm/Addons.js';
import Castle from './modules/Castle';
import { Textures } from './modules/Textures';
import gsap from 'gsap';

export default class Sketch {
	constructor(options) {
		this.container = options.dom;
		this.scene = new Scene();
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;
		this.time = 0;
		this.isPlaying = true;
		this.loadingScreen = document.querySelector('.loading-screen');
		this.perc = document.querySelector('.perc');
		this.bar = document.querySelector('.progress-bar span');

		this.init();
	}

	async init() {
		this.setupRenderer();
		this.setupCamera();
		this.setupControls();
		this.setupResize();

		await this.loadAssets();
		this.createCastle();
		this.createGUI();
		this.render();
	}

	setupRenderer() {
		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(this.width, this.height);
		this.renderer.setClearColor(0xffffff, 1);
		this.renderer.physicallyCorrectLights = true;
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;

		this.container.appendChild(this.renderer.domElement);
	}

	setupCamera() {
		this.camera = new PerspectiveCamera(40, this.width / this.height, 0.1, 1000);
		this.camera.position.set(20, 32, 50);
	}

	setupControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.target.set(0, 8, -2);
		this.controls.maxPolarAngle = Math.PI / 2;
		this.controls.update();
	}

	async loadAssets() {
		const manager = new LoadingManager();

		// Optional: connect to loading screen or progress bar
		manager.onStart = (url, loaded, total) => {
			console.log(`Started loading: ${url} (${loaded}/${total})`);
		};
		manager.onProgress = (url, loaded, total) => {
			console.log(`Loading ${url}: ${loaded}/${total}`);
			const current = parseInt((loaded / total) * 100);
			this.perc.textContent = `${current}%`;

			gsap.to(this.bar, {
				width: `${current}%`,
				ease: 'power3.out',
			});
		};
		manager.onLoad = () => {
			console.log('All assets loaded!');
			// Hide loading screen if needed
			gsap.to(this.loadingScreen, {
				clipPath: 'inset(0% 0% 100% 0%)',
				duration: 1.6,
				delay: 1,
				ease: 'expo.out',
			});

			gsap.set(this.loadingScreen, { css: { display: 'none' }, delay: 2.8 });

			gsap.fromTo(
				this.camera.position,
				{
					x: 42,
					y: 62,
					z: 74,
				},
				{
					x: 20,
					y: 32,
					z: 50,
					delay: 1,
					duration: 2,
					ease: 'power3.inOut',
				}
			);
		};
		manager.onError = (url) => {
			console.error(`Failed to load: ${url}`);
		};

		this.textures = new Textures(manager);
		await this.textures.loadAll();
	}

	createCastle() {
		this.castle = new Castle(this.textures);
		this.scene.add(this.castle.group);
		this.createEnv();
		this.createLights();
	}

	createEnv() {
		const sky = new Sky();
		sky.scale.set(100, 100, 100);
		this.scene.add(sky);
		sky.material.uniforms['turbidity'].value = 10;
		sky.material.uniforms['rayleigh'].value = 3;
		sky.material.uniforms['mieCoefficient'].value = 0.1;
		sky.material.uniforms['mieDirectionalG'].value = 0.95;
		sky.material.uniforms['sunPosition'].value.set(0.3, -0.03, 0.95);

		this.scene.fog = new FogExp2('#04343f', 0.018);
	}

	createLights() {
		const ambientLight = new AmbientLight(0xffffff, 0.5);
		this.scene.add(ambientLight);

		const dirLight = new DirectionalLight(0xffffff, 10);
		dirLight.position.set(16, 25, 60);
		dirLight.target.position.set(0, 3, 0);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.set(512, 512);
		dirLight.shadow.camera.top = 32;
		dirLight.shadow.camera.bottom = -32;
		dirLight.shadow.camera.left = -32;
		dirLight.shadow.camera.right = 32;
		dirLight.shadow.camera.near = 1;
		dirLight.shadow.camera.far = 150;
		this.scene.add(dirLight);
	}

	createGUI() {
		this.guiParams = {
			useTextures: false,
		};
		this.gui = new GUI();

		this.gui
			.add(this.guiParams, 'useTextures')
			.name('Use Textures')
			.onChange((value) => {
				this.castle.toggleTextures(value);
			});
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this));
	}

	resize() {
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;
		this.renderer.setSize(this.width, this.height);
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
	}

	render() {
		if (!this.isPlaying) return;
		this.time += 0.05;
		requestAnimationFrame(this.render.bind(this));
		this.renderer.render(this.scene, this.camera);
		this.controls.update();
	}
}

new Sketch({
	dom: document.getElementById('app'),
});
