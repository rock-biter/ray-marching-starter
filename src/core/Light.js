import { Vec3 } from 'ogl'

class Light {
	/**
	 * @property {Vec3}
	 */
	position = new Vec3(0)

	/**
	 * @property {Vec3}
	 */
	color

	/**
	 * @property {Number}
	 */
	intensity

	constructor({ color = new Vec3(1), intensity = 1 } = {}) {
		this.intensity = intensity
		this.color = color
	}
}
