import { TextureLoader, RepeatWrapping, SRGBColorSpace, LoadingManager, Texture } from 'three';

/**
 * Represents a loader and cache for various texture sets.
 * Supports asynchronous loading and progress tracking.
 */
export class Textures {
	/**
	 * @param {LoadingManager} [manager] - Optional THREE.LoadingManager instance for progress tracking.
	 */
	constructor(manager = new LoadingManager()) {
		/** @type {LoadingManager} */
		this.manager = manager;

		/** @type {TextureLoader} */
		this.loader = new TextureLoader(this.manager);
	}

	/**
	 * Loads all required texture sets asynchronously.
	 * Call this before using any textures.
	 * @returns {Promise<void>}
	 */
	async loadAll() {
		const [floor, wall, tower, towerTop, towerCubes, bush] = await Promise.all([
			this.loadRepeatingTextureSet('/textures/floor/', 20, 20),
			this.loadRepeatingTextureSet('/textures/wall/', 4, 1),
			this.loadRepeatingTextureSet('/textures/tower/', 10, 10),
			this.loadRepeatingTextureSet('/textures/tower/', 12, 1),
			this.loadRepeatingTextureSet('/textures/tower/', 1, 1),
			this.loadRepeatingTextureSet('/textures/bush/', 2, 1),
		]);

		this.floor = floor;
		this.wall = wall;
		this.tower = tower;
		this.towerTop = towerTop;
		this.towerCubes = towerCubes;
		this.bush = bush;
	}

	/**
	 * Loads a single texture asynchronously with repeat wrapping.
	 * @param {string} path
	 * @param {number} repeatX
	 * @param {number} repeatY
	 * @returns {Promise<Texture>}
	 */
	async loadTexture(path, repeatX = 1, repeatY = 1) {
		const tex = await this.loader.loadAsync(path);
		tex.wrapS = tex.wrapT = RepeatWrapping;
		tex.repeat.set(repeatX, repeatY);
		return tex;
	}

	/**
	 * Loads a standard PBR texture set with AO/Roughness/Metalness and normal maps.
	 * @param {string} basePath
	 * @param {number} repeatX
	 * @param {number} repeatY
	 * @returns {Promise<TextureSet>}
	 */
	async loadRepeatingTextureSet(basePath, repeatX = 1, repeatY = 1) {
		const [color, arm, normal] = await Promise.all([
			this.loadTexture(`${basePath}diff_1k.jpg`, repeatX, repeatY).then((t) => this.setColorSpace(t)),
			this.loadTexture(`${basePath}arm_1k.jpg`, repeatX, repeatY),
			this.loadTexture(`${basePath}nor_gl_1k.jpg`, repeatX, repeatY),
		]);

		// Try to load displacement map, catch if not found
		let disp = null;
		try {
			disp = await this.loadTexture(`${basePath}disp_1k.jpg`, repeatX, repeatY);
		} catch (err) {
			console.warn(`[Textures] No displacement map found at ${basePath}disp_1k.jpg`);
		}

		return { color, arm, normal, disp };
	}

	/**
	 * Converts a texture to sRGB color space.
	 * @param {Texture} texture
	 * @returns {Texture}
	 */
	setColorSpace(texture) {
		texture.colorSpace = SRGBColorSpace;
		return texture;
	}
}
