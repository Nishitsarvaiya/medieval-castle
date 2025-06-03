import {
	AmbientLight,
	BoxGeometry,
	CameraHelper,
	CylinderGeometry,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	SRGBColorSpace,
	Scene,
	WebGLRenderer,
} from 'three';
import { OrbitControls, Sky } from 'three/examples/jsm/Addons.js';

export default class Sketch {
	constructor(options) {
		this.scene = new Scene();
		this.container = options.dom;
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;
		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(this.width, this.height);
		this.renderer.setClearColor(0x121212, 1);
		this.renderer.physicallyCorrectLights = true;
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;

		this.container.appendChild(this.renderer.domElement);

		this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
		// var frustumSize = this.height;
		// var aspect = this.width / this.height;
		// this.camera = new OrthographicCamera(
		// 	(frustumSize * aspect) / -2,
		// 	(frustumSize * aspect) / 2,
		// 	frustumSize / 2,
		// 	frustumSize / -2,
		// 	-1000,
		// 	1000
		// );
		this.camera.position.set(8, 20, 40);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.target.set(0, 8, -2);
		this.controls.maxPolarAngle = Math.PI / 2;
		this.controls.update();

		// Defaults
		this.towerDimensions = {
			radiusTop: 4,
			radiusBottom: 5.5,
			height: 16,
			top: {
				count: 8,
				radius: 5,
			},
		};
		this.baseDimensions = {
			width: 200,
			height: 1,
			depth: 180,
		};

		this.wallDimensions = {
			width: 42,
			height: 10,
			depth: 2,
		};

		this.time = 0;
		this.isPlaying = true;
		this.createCastle();
		this.resize();
		this.render();
		this.setupResize();
	}

	createEnv() {
		/**
		 * Sky
		 */
		const sky = new Sky();
		sky.scale.set(100, 100, 100);
		this.scene.add(sky);
		console.log(sky.material.uniforms);
		sky.material.uniforms['turbidity'].value = 10;
		sky.material.uniforms['rayleigh'].value = 3;
		sky.material.uniforms['mieCoefficient'].value = 0.1;
		sky.material.uniforms['mieDirectionalG'].value = 0.95;
		sky.material.uniforms['sunPosition'].value.set(0.3, 0.008, 0.95);

		/**
		 * Fog
		 */
		this.scene.fog = new FogExp2('#04343f', 0.018);
	}

	createCastle() {
		this.createEnv();
		this.createLights();
		this.createMaterials();
		this.createGeometries();
		this.createBase();
		this.createTowers();
		this.createWalls();
	}

	createLights() {
		const ambientLight = new AmbientLight(0xffffff, 0.1);
		this.scene.add(ambientLight);

		const dirLight = new DirectionalLight(0xffffff, 5);
		dirLight.position.set(20, 25, 30);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 1024;
		dirLight.shadow.mapSize.height = 1024;
		dirLight.shadow.camera.top = 32;
		dirLight.shadow.camera.right = 32;
		dirLight.shadow.camera.bottom = -32;
		dirLight.shadow.camera.left = -32;
		dirLight.shadow.camera.near = 1;
		dirLight.shadow.camera.far = 100;
		this.scene.add(dirLight);

		// this.scene.add(new CameraHelper(dirLight.shadow.camera));
	}

	createMaterials() {
		this.blueMaterial = new MeshStandardMaterial({ color: 0x04343f, wireframe: false });
		this.yellowMaterial = new MeshStandardMaterial({ color: 0xffd60a, wireframe: false });
	}

	createGeometries() {
		this.baseGeometry = new BoxGeometry(this.baseDimensions.width, this.baseDimensions.height, this.baseDimensions.depth, 1, 1);
		this.towerGoemetry = new CylinderGeometry(
			this.towerDimensions.radiusTop,
			this.towerDimensions.radiusBottom,
			this.towerDimensions.height,
			16
		);
		this.wallGeometry = new BoxGeometry(this.wallDimensions.width, this.wallDimensions.height, this.wallDimensions.depth, 1, 1);
	}

	createBase() {
		this.base = new Mesh(this.baseGeometry, this.blueMaterial);
		this.base.receiveShadow = true;
		this.scene.add(this.base);
	}

	createTowers() {
		this.createTower(-20, -20);
		this.createTower(20, -20);
	}

	createTower(x, z) {
		const tower = new Mesh(this.towerGoemetry, this.yellowMaterial);
		tower.position.set(x, this.towerDimensions.height / 2 + 0.5, z);
		tower.castShadow = true;
		this.scene.add(tower);

		// Crenellations
		const count = this.towerDimensions.top.count;
		const radius = this.towerDimensions.top.radius;
		const angleStep = (2 * Math.PI) / count;
		const maxHeight = this.towerDimensions.height + this.baseDimensions.height / 2;
		const cubeBottom = new Mesh(new CylinderGeometry(radius + 0.5, radius + 0.5, 2.5, 16), this.yellowMaterial);
		cubeBottom.position.set(x, maxHeight + 1.25, z);
		cubeBottom.castShadow = true;
		this.scene.add(cubeBottom);

		for (let i = 0; i < count; i++) {
			const angle = i * angleStep;
			const cube = new Mesh(new BoxGeometry(2, 1.75, 1), this.yellowMaterial);
			cube.position.set(x + radius * Math.cos(angle), maxHeight + 2.5 + 1.75 / 2, z + radius * Math.sin(angle));
			cube.lookAt(x, maxHeight + 2.5 + 1.75 / 2, z);
			cube.castShadow = true;
			this.scene.add(cube);
		}
	}

	createWalls() {
		// Front Wall
		this.createWall(0, this.wallDimensions.height / 2, -20, 0);

		// Back Wall
		this.createWall(0, this.wallDimensions.height / 2, 20, 0);

		// Left Wall
		this.createWall(-20, this.wallDimensions.height / 2, 0, Math.PI / 2);

		// Right Wall
		this.createWall(20, this.wallDimensions.height / 2, 0, Math.PI / 2);
	}

	createWall(x, y, z, rotationY = 0) {
		const wall = new Mesh(this.wallGeometry, this.blueMaterial);
		wall.position.set(x, y, z);
		wall.rotation.y = rotationY;

		wall.castShadow = true;
		wall.receiveShadow = true;
		this.scene.add(wall);
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
