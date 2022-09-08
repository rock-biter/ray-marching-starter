precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec4 uSphere;

varying vec2 vUv;

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .01

float lerp(float v0, float v1, float t) {
  return v0 + t * (v1 - v0);
}


float sMin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
  return mix(a, b, h) - k * h * (1.0 - h);
}

// float sdSphere( vec3 p, float s )
// {
//   return length(p)-s;
// }
#include ../chunks/sphere_sdf.frag;

float GetDist(vec3 p) {

  // sphere x,y,z,r
  // vec4 sA = vec4(0,1,6,1);

  float distA = sdSphere(p-uSphere.xyz, uSphere.w );
  float l = length(uSphere.xz - p.xz );
  float planeDist = p.y + sin( l*5. - uTime*5. )*0.1 ;
  
  float d = sMin(distA, planeDist,1.);
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

            

            

void main() {

  

  vec2 uv = (gl_FragCoord.xy -0.5*uResolution.xy)/uResolution.y;

  vec3 col = vec3(0.2,0.3,1.);
  vec3 ro = vec3(0,1,0);
  vec3 rd = normalize(vec3(uv.x,uv.y,1));
  float d = RayMarch(ro, rd);
  vec3 p = ro + rd * d;
  float dif = GetLight(p);
  // col = mix(col, (vec3( sin(p.x * (5. + sin(uTime + p.z*0.2) ) + sin(p.z*0.3) + p.z*2. + uTime*5.) ) * 0.2), 0.5);
  float pToS = 1. - length( p - uSphere.xyz ) * 0.2;
  vec3 topCol = vec3(1.,0.2,0.4);
  col *= dif;
  col = mix(col, topCol, p.y*0.5 + 0.2);
  col *= dif + 0.15;
  col *= pToS;

    // gl_FragColor.rgb = vec3(0.8, 0.7, 1.0) + 0.3 * cos(vUv.xyx + uTime);
    gl_FragColor = vec4(col,1.0);
}