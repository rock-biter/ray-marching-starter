//reference: https://iquilezles.org/articles/smoothsteps/

// Cubic Polynomial
float cp_smoothstep( float x )
{
  return x*x*(3.0-2.0*x);
}

// Cubic Polynomial Inverse
float inv_cp_smoothstep( float x )
{
  return 0.5-sin(asin(1.0-2.0*x)/3.0);
}

// Quartic Polynomial
float qp_smoothstep( float x )
{
  return x*x*(2.0-x*x);
}

// Quartic Polynomial Inverse
float inv_qp_smoothstep( float x )
{
  return sqrt(1.0-sqrt(1.0-x));
}

// Quintic Polynomial
float q5p_smoothstep( float x )
{
  return x*x*x*(x*(x*6.0-15.0)+10.0);
}

// Quadratic Rational
float qr_smoothstep( float x )
{
  return x*x/(2.0*x*x-2.0*x+1.0);
}

// Quadratic Rational Inverse
float inv_qr_smoothstep( float x )
{
  return (x-sqrt(x*(1.0-x)))/(2.0*x-1.0);
}

// Cubic Rational
float cr_smoothstep( float x )
{
  return x*x*x/(3.0*x*x-3.0*x+1.0);
}

// Cubic Rational Inverse
float inv_cr_smoothstep( float x )
{
  float a = pow(    x,1.0/3.0);
  float b = pow(1.0-x,1.0/3.0);
  return a/(a+b);
}

// Rational
float r_smoothstep( float x, float n )
{
  return pow(x,n)/(pow(x,n)+pow(1.0-x,n));
}

// Rational Inverse
float inv_r_smoothstep( float x, float n )
{
  return smoothstep( x, 1.0/n );
}

// Piecewise Quadratic
float pwq_smoothstep( float x )
{
  return (x<0.5) ?
  2.0*x*x: 
  2.0*x*(2.0-x)-1.0;
}

// Piecewise Quadratic Inverse
float inv_pwq_smoothstep( float x )
{
  return (x<0.5) ?
  sqrt(0.5*x):
  1.0-sqrt(0.5-0.5*x);
}

// Piecewise Polynomial
float pwp_smoothstep( float x, float n )
{
  return (x<0.5) ?
      0.5*pow(2.0*     x,  n):
  1.0-0.5*pow(2.0*(1.0-x), n);
}

// Piecewise Polynomial Inverse
float inv_pwp_smoothstep( float x, float n )
{
  return (x<0.5) ? 
      0.5*pow(2.0*     x, 1.0/P):
  1.0-0.5*pow(2.0*(1.0-x),1.0/P);
}

// Trigonometric
float tri_smoothstep( float x )
{
  return 0.5-0.5*cos(PI*x);
}

// Trigonometric Inverse
float inv_tri_smoothstep( float x )
{
  return acos(1.0-2.0*x)/PI;
}