precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uCameraLookAt;
uniform vec3 uCameraPosition;
uniform float uCameraZoom;

varying vec2 vUv;

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .01

#define TAU 6.283185
#define PI 3.141592

mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}


// float sdSphere( vec3 p, float s )
// {
//   return length(p)-s;
// }
#include ../sdf/3D/sdSphere.frag;
#include ../chunks/boolean_functions.glsl

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
  vec4 sA = vec4(1,0,0,1);
  vec4 sB = vec4(-1,0,0,1);

  float distA = sdSphere(p-sA.xyz, sA.w );
  float distB = sdSphere(p-sB.xyz, sB.w );
  float planeDist = p.y;
  
  float d = opSmoothUnion(opSmoothUnion(distA,distB, 0.5), planeDist,0.5);
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

float softshadow( in vec3 ro, in vec3 rd, float k )
{

  float dO = 0.;
  float res = 1.0;
  
  for(int i=0; i< MAX_STEPS ; i++) {
      vec3 p = ro + rd * dO;
      float dS = GetDist(p);

      if(dS<SURF_DIST)
        return 0.0;
      
      
      dO += dS;
      res = min( res, k*dS/dO );
  
  }
  
  return res;

}

float GetLight(vec3 p) {

  vec3 lightPos = vec3(0,5,6);
  
  lightPos.xz += vec2(sin(uTime),cos(uTime))*2.;
  vec3 l = normalize(lightPos-p);
  vec3 n = GetNormal(p);
  
  float dif = clamp( dot(n,l), 0., 1. );
  float d = RayMarch(p+n*SURF_DIST*2.,l);
  float sha = softshadow(p+n*SURF_DIST*2., l, 8.);
  
  // if(d<length(lightPos-p)) dif *= clamp(0.5,1.,sha);
  dif *= sha;
  
  return dif;

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

            

void main() {

  vec2 uv = (gl_FragCoord.xy -0.5*uResolution.xy)/uResolution.y;
  vec2 m = uMouse.xy / uResolution.xy;
  vec3 lookAt = uCameraLookAt;
  float zoom = 1.;

  vec3 col = vec3(1.,1.,1.);

  // camera position
  vec3 ro = uCameraPosition;
  // camera rotation
  ro.yz *= Rot( -m.y*PI + 0.3 );
  ro.xz *= Rot(-m.x*TAU + 0.8);

  ro.y = max(ro.y, 0.5);

  // Ray direction
  vec3 rd = GetRayDir( uv, ro, lookAt, uCameraZoom );
  float d = RayMarch(ro, rd);
  vec3 p = ro + rd * d;
  float dif = GetLight(p);

  vec4 sph = vec4( vec3(0.0,2.,2.), 4.4 );
  float h = sphDensity(ro, rd, sph, 100. );

  col *= dif;

  if(h > 0.0) {
    col = mix(col, vec3(0.2,0.5,1.0), h * 0.5);
    col = mix(col, 1.15*vec3(1.,0.9,.6), h*h*h);
  }

  // gl_FragColor.rgb = vec3(0.8, 0.7, 1.0) + 0.3 * cos(vUv.xyx + uTime);
  gl_FragColor = vec4(col,1.0);
}