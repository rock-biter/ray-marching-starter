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

#include ../chunks/lights.frag;

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


vec4 GetLight(vec3 p, vec3 lightPos, vec4 lightColor) {

  // vec3 lightAPos = vec3(0,5,-3);
  // vec4 colorA = vec4(1.0,0.,0.,1.);

  
  // lightPos.xz += vec2(sin(uTime),cos(uTime))*2.;

  vec3 l = normalize(lightPos-p);
  vec3 n = GetNormal(p);
  
  float dif = clamp( dot(n,l), 0., 1. );
  float d = RayMarch(p+n*SURF_DIST*2.,l);
  float sha = softshadow(p+n*SURF_DIST*2., l, 12.);

  // lightColor.rgb = clamp(lightColor.rgb * (1. - d), 0., 1.);
  // if(d<length(lightPos-p)) dif *= clamp(0.5,1.,sha);
  // lightColor.rgb -= (d*0.005);
  dif *= sha;
  float decay = clamp(length(lightPos-p) * 0.1, 0., 1. );
  lightColor.rgb *= (1. - decay*decay*decay*decay);
  
  
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
  vec3 col = vec3(.9,.9,.9);

  // Ray origin
  vec3 ro = getRayOrigin();
  // Ray direction
  vec3 rd = GetRayDir( uv, ro, lookAt, uCameraZoom );
  // Ray marching
  float d = RayMarch(ro, rd);
  // Point
  vec3 p = ro + rd * d;
  // Light on point

  vec3 blPos = vec3(4,4,-3);
  blPos.xz += vec2(sin(uTime),cos(uTime))*6.;
  vec3 brPos = vec3(-3,5,3);
  brPos.yz += vec2(-sin(uTime),cos(uTime))*4.;

  vec4 light = GetLight(p, brPos,vec4(1.,0.,0.,1.0));
  vec4 blueLight = GetLight(p, blPos,vec4(0.,0.,1.,1.));
  float dif = light.w;

  col += light.rgb;
  col += blueLight.rgb;
  // col = mix(col, light.rgb,0.9);

  col *= clamp(dif,0.2,1.);
  col *= clamp(blueLight.w,0.2,1.);
  col = clamp(col,0.1,1.);

  // vec4 sph = vec4( vec3(0.0,2.,2.), 4.4 );
  // float h = sphDensity(ro, rd, sph, 100. );

  // Color opf point
  // col *= dif;

  // if(h > 0.0) {
  //   col = mix(col, vec3(0.2,0.5,1.0), h );
  //   col = mix(col, 1.15*vec3(1.,0.9,.6), h*h*h);
  // }

  // gl_FragColor.rgb = vec3(0.8, 0.7, 1.0) + 0.3 * cos(vUv.xyx + uTime);
  gl_FragColor = vec4(col,1.0);
}