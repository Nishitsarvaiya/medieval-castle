import { TextureLoader, RepeatWrapping, SRGBColorSpace } from 'three';

export class Textures {
	constructor() {
		this.loader = new TextureLoader();

		this.floor = this.loadRepeatingTextureSet('./floor/coast_sand_rocks_02_1k/', 8);
		this.wall = this.loadRepeatingTextureSet('./wall/castle_brick_broken_06_1k/');
		this.roof = this.loadRepeatingTextureSet('./roof/roof_slates_02_1k/', 3, 1);
		this.bush = this.loadRepeatingTextureSet('./bush/leaves_forest_ground_1k/', 2, 1);
		this.grave = this.loadRepeatingTextureSet('./grave/plastered_stone_wall_1k/', 0.3, 0.4);
		this.door = this.loadDoorTextures('./door/');
	}

	loadTexture(path, repeatX = 1, repeatY = 1) {
		const tex = this.loader.load(path);
		tex.wrapS = tex.wrapT = RepeatWrapping;
		tex.repeat.set(repeatX, repeatY);
		return tex;
	}

	loadRepeatingTextureSet(basePath, repeatX = 1, repeatY = 1) {
		return {
			color: this.setColorSpace(this.loadTexture(`${basePath}diff_1k.jpg`, repeatX, repeatY)),
			arm: this.loadTexture(`${basePath}arm_1k.jpg`, repeatX, repeatY),
			normal: this.loadTexture(`${basePath}nor_gl_1k.jpg`, repeatX, repeatY),
			disp: this.loadTexture(`${basePath}disp_1k.jpg`, repeatX, repeatY),
		};
	}

	loadDoorTextures(basePath) {
		return {
			color: this.setColorSpace(this.loader.load(`${basePath}color.jpg`)),
			alpha: this.loader.load(`${basePath}alpha.jpg`),
			ao: this.loader.load(`${basePath}ambientOcclusion.jpg`),
			normal: this.loader.load(`${basePath}normal.jpg`),
			metalness: this.loader.load(`${basePath}metalness.jpg`),
			roughness: this.loader.load(`${basePath}roughness.jpg`),
			height: this.loader.load(`${basePath}height.jpg`),
		};
	}

	setColorSpace(texture) {
		texture.colorSpace = SRGBColorSpace;
		return texture;
	}
}
