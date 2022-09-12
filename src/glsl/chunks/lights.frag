// Soft shadow
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