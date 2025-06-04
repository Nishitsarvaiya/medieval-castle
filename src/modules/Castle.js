import {
	BoxGeometry,
	CylinderGeometry,
	Euler,
	Group,
	InstancedMesh,
	Matrix4,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	PlaneGeometry,
	Quaternion,
	SphereGeometry,
	Vector3,
} from 'three';

/**
 * Class representing a castle scene component.
 * Composed of towers, walls, a base, and decorative bushes.
 */
export default class Castle {
	/**
	 * Create a Castle.
	 * @param {Object} textures - Set of texture maps for different parts of the castle.
	 */
	constructor(textures) {
		this.group = new Group();
		this.textures = textures;

		this.initConstants();
		this.createMaterials();
		this.createGeometries();

		this.createBase();
		this.createTowers();
		this.createWalls();
		this.createBushes();
	}

	/** Initialize geometric constants */
	initConstants() {
		this.towerDimensions = {
			radiusTop: 4,
			radiusBottom: 5.5,
			height: 16,
			top: {
				count: 8,
				radius: 5,
			},
		};
		this.baseDimensions = { width: 200, height: 180 };
		this.wallDimensions = { width: 42, height: 10, depth: 2 };
		this.bushes = [
			{ scale: 3.75, x: 2, z: 2.6 },
			{ scale: 2, x: 4.5, z: 2.5 },
			{ scale: 2.5, x: -8.8, z: 2.7 },
			{ scale: 1.3, x: -1.2, z: 2.4 },
			{ scale: 0.95, x: 20, z: 2.25 },
			{ scale: 2.7, x: 18, z: 2.05 },
			{ scale: 2.25, x: -21.8, z: -10 },
			{ scale: 1.25, x: -21.3, z: -12 },
			{ scale: 4.25, x: -21.8, z: -34 },
			{ scale: 2.25, x: -21, z: -31.8 },
			{ scale: 3.25, x: 22, z: -12 },
			{ scale: 1.75, x: 22, z: -8 },
			{ scale: 4.4, x: 21.5, z: -28 },
			{ scale: 2.8, x: 22.1, z: -25.8 },
			{ scale: 2.1, x: 10.1, z: -2.4 },
			{ scale: 3.2, x: 18.7, z: -10.3 },
			{ scale: 2.9, x: -17.2, z: -12.1 },
			{ scale: 1.5, x: -17.5, z: -8.6 },
			{ scale: 1.8, x: -18.7, z: -20.95 },
			{ scale: 1.95, x: 18.7, z: -18.2 },
			{ scale: 3.6, x: -8.7, z: -39.35 },
			{ scale: 2.7, x: 1.7, z: -39.55 },
		];
	}

	/** Prepares shared materials */
	createMaterials() {
		const makeTexturedMaterial = ({ color, arm, normal, disp, displacementScale }) => {
			return new MeshStandardMaterial({
				map: color,
				aoMap: arm,
				normalMap: normal,
				roughnessMap: arm,
				metalnessMap: arm,
				displacementMap: disp,
				displacementScale: displacementScale,
			});
		};

		const fallbackBlue = new MeshStandardMaterial({ color: 0x0466c8 });
		const fallbackYellow = new MeshStandardMaterial({ color: 0xffd500 });
		const fallbackGreen = new MeshStandardMaterial({ color: 0x588157 });

		const t = this.textures;
		console.log({ t });

		this.materials = {
			floor: {
				textured: new MeshStandardMaterial({
					map: this.textures.floor.color,
					aoMap: this.textures.floor.arm,
					roughnessMap: this.textures.floor.arm,
					metalnessMap: this.textures.floor.arm,
					normalMap: this.textures.floor.normal,
					displacementMap: this.textures.floor.disp,
					displacementScale: 0.015,
				}),
				flat: fallbackBlue,
			},
			wall: {
				textured: new MeshStandardMaterial({
					color: 0x04343f,
					map: this.textures.wall.color,
					aoMap: this.textures.wall.arm,
					roughnessMap: this.textures.wall.arm,
					metalnessMap: this.textures.wall.arm,
					normalMap: this.textures.wall.normal,
				}),
				flat: fallbackBlue,
			},
			tower: {
				textured: new MeshStandardMaterial({
					map: this.textures.tower.color,
					aoMap: this.textures.tower.arm,
					roughnessMap: this.textures.tower.arm,
					metalnessMap: this.textures.tower.arm,
					normalMap: this.textures.tower.normal,
				}),
				flat: fallbackYellow,
			},
			towerTop: {
				textured: new MeshStandardMaterial({
					map: this.textures.towerTop.color,
					aoMap: this.textures.towerTop.arm,
					roughnessMap: this.textures.towerTop.arm,
					metalnessMap: this.textures.towerTop.arm,
					normalMap: this.textures.towerTop.normal,
				}),
				flat: fallbackYellow,
			},
			towerCubes: {
				textured: new MeshStandardMaterial({
					map: this.textures.towerCubes.color,
					aoMap: this.textures.towerCubes.arm,
					roughnessMap: this.textures.towerCubes.arm,
					metalnessMap: this.textures.towerCubes.arm,
					normalMap: this.textures.towerCubes.normal,
				}),
				flat: fallbackYellow,
			},
			bush: {
				textured: new MeshStandardMaterial({
					color: '#adc178',
					map: this.textures.bush.color,
					aoMap: this.textures.bush.arm,
					normalMap: this.textures.bush.normal,
					roughnessMap: this.textures.bush.arm,
					metalnessMap: this.textures.bush.arm,
				}),
				flat: fallbackGreen,
			},
		};

		this.setMaterialType('flat');
	}

	/**
	 * Set material mode
	 * @param {'flat' | 'textured'} type
	 */
	setMaterialType(type) {
		this.floorMaterial = this.materials.floor[type];
		this.wallMaterial = this.materials.wall[type];
		this.towerMaterial = this.materials.tower[type];
		this.towerTopMaterial = this.materials.towerTop[type];
		this.towerCubesMaterial = this.materials.towerCubes[type];
		this.bushMaterial = this.materials.bush[type];
	}

	/** Pre-creates geometries used in the scene */
	createGeometries() {
		this.baseGeometry = new PlaneGeometry(this.baseDimensions.width, this.baseDimensions.height, 4, 4);
		this.towerGeometry = new CylinderGeometry(
			this.towerDimensions.radiusTop,
			this.towerDimensions.radiusBottom,
			this.towerDimensions.height,
			16
		);
		this.wallGeometry = new BoxGeometry(
			this.wallDimensions.width,
			this.wallDimensions.height,
			this.wallDimensions.depth,
			12,
			12
		);
		this.bushGeometry = new SphereGeometry(0.5, 12, 12);
		this.towerTopGeometry = new CylinderGeometry(
			this.towerDimensions.top.radius + 0.5,
			this.towerDimensions.top.radius + 0.5,
			2.5,
			16
		);
		this.crenelationGeometry = new BoxGeometry(2, 1.75, 1, 1, 1);
	}

	/** Creates the castle base */
	createBase() {
		const base = new Mesh(this.baseGeometry, this.floorMaterial);
		base.rotation.x = -Math.PI / 2;
		base.receiveShadow = true;
		this.group.add(base);
		this.base = base;
	}

	/** Creates all towers */
	createTowers() {
		this.createTower(-20, -20);
		this.createTower(20, -20);
	}

	/**
	 * Creates an individual tower at a given (x, z) location
	 * @param {number} x
	 * @param {number} z
	 */
	createTower(x, z) {
		const h = this.towerDimensions.height;

		const tower = new Mesh(this.towerGeometry, this.towerMaterial);
		tower.position.set(x, h / 2, z);
		tower.castShadow = true;
		this.group.add(tower);

		const towerTop = new Mesh(this.towerTopGeometry, this.towerTopMaterial);
		towerTop.position.set(x, h + 1.25, z);
		towerTop.castShadow = true;
		this.group.add(towerTop);

		const angleStep = (2 * Math.PI) / this.towerDimensions.top.count;
		for (let i = 0; i < this.towerDimensions.top.count; i++) {
			const { top } = this.towerDimensions;
			const instanceCount = top.count;
			const instancedMesh = new InstancedMesh(this.crenelationGeometry, this.towerCubesMaterial, instanceCount);

			const dummy = new Object3D();
			const angleStep = (2 * Math.PI) / instanceCount;

			for (let i = 0; i < instanceCount; i++) {
				const angle = i * angleStep;

				const px = x + (top.radius - 0.1) * Math.cos(angle);
				const py = h + 2.5 + 0.875;
				const pz = z + (top.radius - 0.1) * Math.sin(angle);

				dummy.position.set(px, py, pz);
				dummy.lookAt(x, py, z);
				dummy.updateMatrix();

				instancedMesh.setMatrixAt(i, dummy.matrix);
			}

			instancedMesh.castShadow = true;
			this.group.add(instancedMesh);
		}
	}

	/** Creates all four castle walls */
	createWalls() {
		const halfHeight = this.wallDimensions.height / 2;
		this.createWall(0, halfHeight, -20, 0); // front
		this.createWall(0, halfHeight, 22, 0); // back
		this.createWall(-20, halfHeight, 0, Math.PI / 2); // left
		this.createWall(20, halfHeight, 0, Math.PI / 2); // right
	}

	/**
	 * Create a single wall segment
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {number} rotationY
	 */
	createWall(x, y, z, rotationY = 0) {
		const wall = new Mesh(this.wallGeometry, this.wallMaterial);
		wall.position.set(x, y, z);
		wall.rotation.y = rotationY;
		wall.castShadow = true;
		wall.receiveShadow = true;
		this.group.add(wall);
	}

	/** Creates instanced bushes around the castle */
	createBushes() {
		const instancedBushes = new InstancedMesh(this.bushGeometry, this.bushMaterial, this.bushes.length);
		instancedBushes.castShadow = true;
		instancedBushes.receiveShadow = true;

		const dummy = new Matrix4();
		const rotation = new Quaternion().setFromEuler(new Euler(-Math.PI / 3, 0, 0));

		this.bushes.forEach((b, i) => {
			const scale = b.scale * 1.5;
			dummy.compose(
				new Vector3(b.x, 0, this.wallDimensions.width / 2 + b.z),
				rotation,
				new Vector3(scale, scale, scale)
			);
			instancedBushes.setMatrixAt(i, dummy);
		});

		this.group.add(instancedBushes);
	}

	/**
	 * Toggle texture mode between flat color and detailed textures
	 * @param {boolean} enabled - True for textures, false for flat
	 */
	toggleTextures(enabled) {
		const type = enabled ? 'textured' : 'flat';
		this.setMaterialType(type);
		this.base.material = this.floorMaterial;

		this.group.traverse((child) => {
			if (!child.isMesh) return;

			switch (child.geometry) {
				case this.wallGeometry:
					child.material = this.wallMaterial;
					break;
				case this.towerGeometry:
					child.material = this.towerMaterial;
					break;
				case this.towerTopGeometry:
					child.material = this.towerTopMaterial;
					break;
				case this.crenelationGeometry:
					child.material = this.towerCubesMaterial;
					break;
				case this.bushGeometry:
					child.material = this.bushMaterial;
					break;
				default:
					break;
			}
		});
	}
}
