import { Vec3 } from 'ogl'

class Camera {
	id = Symbol('camera')

	uniforms = {
		uCameraPosition: { value: new Vec3(0, 3, -5) },
		uCameraRotation: { value: new Vec3(0) },
		uCameraLookAt: { value: new Vec3(0) },
		uCameraZoom: { value: 1 },
	}

	constructor() {}

	/**
	 * @return {Vec3}
	 */
	get lookAt() {
		return this.uniforms.uLookAt.value
	}

	/**
	 *
	 * @param {Vec3} pos
	 */
	set lookAt(pos) {
		this.uniforms.uCameraLookAt.value.copy(pos)
	}

	/**
	 * @return {Vec3}
	 */
	get position() {
		return this.uniforms.position.value
	}

	/**
	 *
	 * @param {Vec3} pos
	 */
	set position(pos) {
		this.uniforms.uCameraPosition.value.copy(pos)
	}

	/**
	 * @returns {Number}
	 */
	get zoom() {
		return this.uniforms.zoom.value
	}

	/**
	 * @param {Number} n
	 */
	set zoom(n) {
		this.uniforms.uCameraZoom.value = n
	}
}

export default Camera
