import './style.css'
// import sphereSdf from './src/glsl/chunks/sphere_sdf.glsl'
// console.log(sphereSdf)
import fragment from './src/glsl/examples/blob_wave.frag'

import { Renderer, Geometry, Program, Mesh, Vec2, Vec4, Post } from 'ogl'

const lerp = (a, b, x) => {
	return a + x * (b - a)
}

{
	const renderer = new Renderer({})
	const gl = renderer.gl
	document.body.appendChild(gl.canvas)

	const post = new Post(gl)

	const mouse = new Vec2(0)
	const uniforms = {
		uTime: { value: 0 },
		uResolution: { value: new Vec2(window.innerWidth, window.innerHeight) },
		uMouse: { value: mouse },
		uSphere: { value: new Vec4(1, 0, 6, 1) },
	}

	const onMove = (e) => {
		mouse.x = (e.pageX / window.innerWidth - 0.5) * 5
		mouse.y = (e.pageY / window.innerHeight - 0.5) * 2
	}

	document.body.addEventListener('mousemove', onMove)
	document.body.addEventListener('touchmove', onMove)

	function resize() {
		renderer.setSize(window.innerWidth, window.innerHeight)
		uniforms.uResolution.value.x = window.innerWidth
		uniforms.uResolution.value.y = window.innerHeight
		post.resize({ width: window.innerWidth, height: window.innerHeight })
		// camera.perspective({
		//     aspect: gl.canvas.width / gl.canvas.height,
		// });
	}
	window.addEventListener('resize', resize, false)
	resize()

	// Triangle that covers viewport, with UVs that still span 0 > 1 across viewport
	const geometry = new Geometry(gl, {
		position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
		uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
	})
	// Alternatively, you could use the Triangle class.

	const program = new Program(gl, {
		vertex: /* glsl */ `
            attribute vec2 uv;
            attribute vec2 position;

            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0, 1);
            }
        `,
		fragment: fragment,
		uniforms,
	})

	const mesh = new Mesh(gl, { geometry, program })

	const pass = post.addPass({
		fragment: /* glsl */ `
    precision highp float;
    // Default uniform for previous pass is 'tMap'.
    // Can change this using the 'textureUniform' property
    // when adding a pass.
    uniform sampler2D tMap;
    uniform vec2 uResolution;
    varying vec2 vUv;
    vec4 fxaa(sampler2D tex, vec2 uv, vec2 resolution) {
        vec2 pixel = vec2(1.) / resolution;
        vec3 l = vec3(0.299, 0.587, 0.114);
        float lNW = dot(texture2D(tex, uv + vec2(-1, -1) * pixel).rgb, l);
        float lNE = dot(texture2D(tex, uv + vec2( 1, -1) * pixel).rgb, l);
        float lSW = dot(texture2D(tex, uv + vec2(-1,  1) * pixel).rgb, l);
        float lSE = dot(texture2D(tex, uv + vec2( 1,  1) * pixel).rgb, l);
        float lM  = dot(texture2D(tex, uv).rgb, l);
        float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
        float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
        
        vec2 dir = vec2(
            -((lNW + lNE) - (lSW + lSE)),
            ((lNW + lSW) - (lNE + lSE))
        );
        
        float dirReduce = max((lNW + lNE + lSW + lSE) * 0.03125, 0.0078125);
        float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
        dir = min(vec2(8, 8), max(vec2(-8, -8), dir * rcpDirMin)) * pixel;
        
        vec3 rgbA = 0.5 * (
            texture2D(tex, uv + dir * (1.0 / 3.0 - 0.5)).rgb +
            texture2D(tex, uv + dir * (2.0 / 3.0 - 0.5)).rgb);
        vec3 rgbB = rgbA * 0.5 + 0.25 * (
            texture2D(tex, uv + dir * -0.5).rgb +
            texture2D(tex, uv + dir * 0.5).rgb);
        float lB = dot(rgbB, l);
        return mix(
            vec4(rgbB, 1),
            vec4(rgbA, 1),
            max(sign(lB - lMin), 0.0) * max(sign(lB - lMax), 0.0)
        );
    }
    void main() {
        vec4 raw = texture2D(tMap, vUv);
        vec4 aa = fxaa(tMap, vUv, uResolution);
        // Split screen in half to show side-by-side comparison
        gl_FragColor = mix(raw, aa, step(0., vUv.x));
        // Darken left side a tad for clarity
        // gl_FragColor -= step(vUv.x, 0.) * 0.1;
    }
`,
		uniforms,
	})

	requestAnimationFrame(update)
	function update(t) {
		requestAnimationFrame(update)

		program.uniforms.uTime.value = t * 0.001
		const x = uniforms.uSphere.value.x
		const y = uniforms.uSphere.value.y
		uniforms.uSphere.value.x = lerp(x, 1 + mouse.x, 0.05)
		uniforms.uSphere.value.y = lerp(y, -mouse.y, 0.05)

		// Don't need a camera if camera uniforms aren't required
		post.render({ scene: mesh })
	}
}
