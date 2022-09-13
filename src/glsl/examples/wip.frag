precision highp float;

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .01

#define TAU 6.283185
#define PI 3.141592

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uCameraLookAt;
uniform vec3 uCameraPosition;
uniform vec3 uCameraRotation;
uniform float uCameraZoom;
uniform float uCameraSpeed;

varying vec2 vUv;

#include ../sdf/3D/sdSphere.frag;
#include ../chunks/boolean_functions.glsl;
#include ../chunks/transform_functions.glsl;

struct Surface {
    vec3 ambientColor;
    vec3 diffuseColor;
    float signedDistance;
};

float sphDensity( vec3 ro, vec3 rd, vec4 sph, float dbuffer )
{
    float ndbuffer = dbuffer/sph.w;
    vec3  rc = (ro - sph.xyz)/sph.w;
	
    float b = dot(rd,rc);
    float c = dot(rc,rc) - 1.0;
    float h = b*b - c;
    if( h<0.0 ) return 0.0;
    h = sqrt( h );
    float t1 = -b - h;
    float t2 = -b + h;

    if( t2<0.0 || t1>ndbuffer ) return 0.0;
    t1 = max( t1, 0.0 );
    t2 = min( t2, ndbuffer );

    float i1 = -(c*t1 + b*t1*t1 + t1*t1*t1/3.0);
    float i2 = -(c*t2 + b*t2*t2 + t2*t2*t2/3.0);
    return (i2-i1)*(3.0/4.0);
}

float GetDist(vec3 p) {

  // sphere x,y,z,r
  vec4 sA = vec4(1,0.,0,1);
  vec4 sB = vec4(0,0.5,0.5,1);
  sA.x += sin(uTime*2.);
  sA.z += cos(uTime*1.);
  sA.y += sin(uTime*2.) + 0.5;

  sB.x -= sin(uTime*1.)*3.;
  sB.z += cos(uTime*2.)*1.5;
  sB.y += cos(uTime*1.)*2.5 + 1.5;

  float distA = sdSphere(p-sA.xyz, sA.w );
  float distB = sdSphere(p-sB.xyz, sB.w );
  float planeDist = p.y;
  
  float d = opSmoothUnion(opSmoothUnion(distA,distB, 0.8), planeDist,0.5);
  return d;
  
}

Surface SmoothUnion(in Surface surface1, in Surface surface2, in float smoothness) {
    float interpolation = clamp(0.5 + 0.5 * (surface2.signedDistance - surface1.signedDistance) / smoothness, 0.0, 1.0);
    return Surface(mix(surface2.ambientColor, surface1.ambientColor, interpolation),// - smoothness * interpolation * (1.0 - interpolation);
                   mix(surface2.diffuseColor, surface1.diffuseColor, interpolation),// - smoothness * interpolation * (1.0 - interpolation);
                  //  mix(surface2.specularColor, surface1.specularColor, interpolation),// - smoothness * interpolation * (1.0 - interpolation);
                  //  mix(surface2.shininess, surface1.shininess, interpolation),// - smoothness * interpolation * (1.0 - interpolation);
                   mix(surface2.signedDistance, surface1.signedDistance, interpolation) - smoothness * interpolation * (1.0 - interpolation));
}

Surface mapScene(in vec3 p) {

  vec3 sphPos = vec3(1,.4,0.3);
  sphPos.y += sin(uTime*2.)*3.;
  Surface sph = Surface(
    vec3(0),
    vec3(1.9,1.9,1.9),
    sdSphere(p - sphPos, 1. )
  );

  Surface ground = Surface(vec3(0),vec3(0.5,0.5,0.5), p.y);

  return SmoothUnion(sph,ground,3.);

}

#include ../chunks/lights.frag;

// float RayMarch(vec3 ro, vec3 rd) {
//   float dO = 0.;
  
//   for(int i=0; i< MAX_STEPS; i++) {
//       vec3 p = ro + rd * dO;
//       float dS = GetDist(p);
      
//       dO += dS;
//       if(dO > MAX_DIST || dS < SURF_DIST) break;
      
  
//   }
  
//   return dO;

// }

Surface RayMarch(vec3 ro, vec3 rd) {
  float dO = 0.;
  Surface s = Surface(vec3(0),vec3(0.),MAX_DIST+1.);
  
  for(int i=0; i< MAX_STEPS; i++) {
      vec3 p = ro + rd * dO;
      s = mapScene(p);
      float dS = s.signedDistance;
      dO += dS;
      if(dO > MAX_DIST || dS < SURF_DIST) break;
  }
  
  s.signedDistance = dO;
  return s;

}


vec3 GetNormal(vec3 p) {
  float d = mapScene(p).signedDistance;
  //trick
  vec2 e = vec2(0.01,0);
  
  vec3 n = vec3(
      d-mapScene(p-e.xyy).signedDistance,
      d-mapScene(p-e.yxy).signedDistance,
      d-mapScene(p-e.yyx).signedDistance
  );
  
  return normalize(n);
}


vec4 GetLight(vec3 p, vec3 lightPos, vec4 lightColor, float decayFactor ) {

  // lightPos.xz += vec2(sin(uTime),cos(uTime))*2.;

  vec3 l = normalize(lightPos-p);
  vec3 n = GetNormal(p);
  
  float dif = clamp( dot(n,l), 0., 1. );
  // Surface s = RayMarch(p+n*SURF_DIST*2.,l);
  // float d = s.signedDistance;
  float sha = surfaceSoftshadow(p+n*SURF_DIST*2., l, 12.);

  // lightColor.rgb = clamp(lightColor.rgb * (1. - d), 0., 1.);
  // if(d<length(lightPos-p)) dif *= clamp(0.5,1.,sha);
  // lightColor.rgb -= (d*0.005);
  dif *= sha;
  float decay = clamp(length(lightPos-p) * 0.1, 0., 1. );
  lightColor.rgb *= (1. - decay*decay*decay*decay*decayFactor);
  
  
  return vec4(lightColor.rgb * lightColor.a , dif);

}

vec3 GetRayDir(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 
        f = normalize(l-p),
        r = normalize(cross(vec3(0,1,0), f)),
        u = cross(f,r),
        c = f*z,
        i = c + uv.x*r + uv.y*u;
    return normalize(i);
}          

vec3 getRayOrigin() {
  vec3 ro = uCameraPosition;
  float cs = uCameraSpeed * 0.001;
  // camera rotation
  ro.yz *= Rot( cs * uCameraRotation.y *PI );
  // ro.yz *= Rot( -m.y*PI );
  ro.xz *= Rot( cs * uCameraRotation.x*TAU);
  // ro.xz *= Rot(-m.x*TAU);

  ro.y = max(ro.y, 0.5);

  return ro;
}           

void main() {

  vec2 uv = (gl_FragCoord.xy -0.5*uResolution.xy)/uResolution.y;
  // vec2 m = uMouse.xy / uResolution.xy;
  vec3 lookAt = uCameraLookAt;
  // Basic scene color
  vec3 col = vec3(.0,.0,.0);

  // Ray origin
  vec3 ro = getRayOrigin();
  // Ray direction
  vec3 rd = GetRayDir( uv, ro, lookAt, uCameraZoom );
  // ray marching surface
  Surface s = RayMarch(ro, rd);
  // surface distance
  float d = s.signedDistance;
  // surface color
  col = s.diffuseColor;
  // Point
  vec3 p = ro + rd * d;
  // Light on point
  vec3 brPos = vec3(3,3.5,-5);
  brPos.xz += vec2(-sin(uTime),cos(uTime))*3.;

  vec4 light = GetLight(p, brPos,vec4(0.9,.5,.0,0.8),1.);
  light += GetLight(p, vec3(-10,5,-3),vec4(0.9,.0,.0,1.),1.);
  float dif = light.w;
  col = mix(col,light.rgb,0.5);

  col *= clamp(dif,0.2,1.);

  gl_FragColor = vec4(col,1.0);
}