//reference: https://iquilezles.org/articles/distfunctions/

mat2 Rot(float a) {
  float s=sin(a), c=cos(a);
  return mat2(c, -s, s, c);
}

// TODO fix sintax error

// Rotation/Translation
// vec3 opTx( in vec3 p, in transform t, in sdf3d primitive )
// {
//   return primitive( invert(t)*p );
// }

// Scale
// float opScale( in vec3 p, in float s, in sdf3d primitive )
// {
//   return primitive(p/s)*s;
// }

// Symmetry
// float opSymX( in vec3 p, in sdf3d primitive )
// {
//   p.x = abs(p.x);
//   return primitive(p);
// }

// float opSymXZ( in vec3 p, in sdf3d primitive )
// {
//   p.xz = abs(p.xz);
//   return primitive(p);
// }

// Infinite Repetition
// float opRep( in vec3 p, in vec3 c, in sdf3d primitive )
// {
//   vec3 q = mod(p+0.5*c,c)-0.5*c;
//   return primitive( q );
// }

// Finite Repetition
// vec3 opRepLim( in vec3 p, in float c, in vec3 l, in sdf3d primitive )
// {
//     vec3 q = p-c*clamp(round(p/c),-l,l);
//     return primitive( q );
// }

// Displacement
// float opDisplace( in sdf3d primitive, in vec3 p )
// {
//   float d1 = primitive(p);
//   float d2 = displacement(p);
//   return d1+d2;
// }

// Twist
// float opTwist( in sdf3d primitive, in vec3 p )
// {
//   const float k = 10.0; // or some other amount
//   float c = cos(k*p.y);
//   float s = sin(k*p.y);
//   mat2  m = mat2(c,-s,s,c);
//   vec3  q = vec3(m*p.xz,p.y);
//   return primitive(q);
// }

// Bend
// float opCheapBend( in sdf3d primitive, in vec3 p )
// {
//   const float k = 10.0; // or some other amount
//   float c = cos(k*p.x);
//   float s = sin(k*p.x);
//   mat2  m = mat2(c,-s,s,c);
//   vec3  q = vec3(m*p.xy,p.z);
//   return primitive(q);
// }