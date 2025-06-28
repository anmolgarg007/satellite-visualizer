import React from "react";
import { Entity, PolylineGraphics } from "resium";
import { Cartesian3, Color } from "cesium";

const MoonOrbitTrail = ({ positions }) => {
  return (
    <Entity name="Moon Orbit Trail">
      <PolylineGraphics 
        positions={positions} 
        width={1.5} 
        material={Color.LIGHTGRAY.withAlpha(0.6)}
        clampToGround={false}
      />
    </Entity>
  );
};

export default MoonOrbitTrail;