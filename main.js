import './style.css'

import { Renderer, Geometry, Program, Mesh, Vec2 } from 'ogl'

{
	const renderer = new Renderer({
		width: window.innerWidth,
		height: window.innerHeight,
	})
	const gl = renderer.gl
	document.body.appendChild(gl.canvas)

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
		fragment: /* glsl */ `
            precision highp float;

            uniform float uTime;
            uniform vec2 uResolution;

            varying vec2 vUv;

            #define MAX_STEPS 100
            #define MAX_DIST 100.
            #define SURF_DIST .01

            float sMin(float a, float b, float k) {
              float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
              return mix(a, b, h) - k * h * (1.0 - h);
            }

            float sdSphere( vec3 p, float s )
            {
              return length(p)-s;
            }

            float GetDist(vec3 p) {

              // sphere x,y,z,r
              vec4 sA = vec4(0,1,6,1);
            
              float distA = sdSphere(p-sA.xyz, sA.w );
              float planeDist = p.y;
              
              float d =min(distA, planeDist);
              return d;
              
            }

            float RayMarch(vec3 ro, vec3 rd) {
              float dO = 0.;
              
              for(int i=0; i< MAX_STEPS; i++) {
                  vec3 p = ro + rd * dO;
                  float dS = GetDist(p);
                  
                  dO += dS;
                  if(dO > MAX_DIST || dS < SURF_DIST) break;
                  
              
              }
              
              return dO;
          
            }

            vec3 GetNormal(vec3 p) {
              float d = GetDist(p);
              //trick
              vec2 e = vec2(0.01,0);
              
              vec3 n = vec3(
                  d-GetDist(p-e.xyy),
                  d-GetDist(p-e.yxy),
                  d-GetDist(p-e.yyx)
              );
              
              return normalize(n);
            }

            float GetLight(vec3 p) {

              vec3 lightPos = vec3(0,5,6);
              
              lightPos.xz += vec2(sin(uTime),cos(uTime))*2.;
              vec3 l = normalize(lightPos-p);
              vec3 n = GetNormal(p);
              
              float dif = clamp( dot(n,l), 0., 1. );
              float d = RayMarch(p+n*SURF_DIST*2.,l);
              
              if(d<length(lightPos-p)) dif *= 0.1;
              
              return dif;
          
            }

            

            void main() {

              vec2 uv = (gl_FragCoord.xy -0.5*uResolution.xy)/uResolution.y;

              vec3 col = vec3(1);
              vec3 ro = vec3(0,1,0);
              vec3 rd = normalize(vec3(uv.x,uv.y,1));
              float d = RayMarch(ro, rd);
              vec3 p = ro + rd * d;
              float dif = GetLight(p);
              col = vec3(dif);

                // gl_FragColor.rgb = vec3(0.8, 0.7, 1.0) + 0.3 * cos(vUv.xyx + uTime);
                gl_FragColor = vec4(col,1.0);
            }
        `,
		uniforms: {
			uTime: { value: 0 },
			uResolution: { value: new Vec2(window.innerWidth, window.innerHeight) },
		},
	})

	const mesh = new Mesh(gl, { geometry, program })

	requestAnimationFrame(update)
	function update(t) {
		requestAnimationFrame(update)

		program.uniforms.uTime.value = t * 0.001

		// Don't need a camera if camera uniforms aren't required
		renderer.render({ scene: mesh })
	}
}
