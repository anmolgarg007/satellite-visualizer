import React, { useEffect, useRef } from "react";
import { Entity } from "resium";
import { Cartesian3, Color, HeadingPitchRoll, Transforms } from "cesium";

const MoonModel = ({ viewerRef, moonData }) => {
  const moonEntityRef = useRef();

  useEffect(() => {
    if (!viewerRef.current || !moonEntityRef.current || !moonData) return;

    const moonPosition = Cartesian3.fromElements(
      moonData.position.x,
      moonData.position.y,
      moonData.position.z
    );

    // Update moon position and orientation
    moonEntityRef.current.position = moonPosition;
    
    const hpr = new HeadingPitchRoll(
      moonData.rotation.longitude,
      moonData.rotation.latitude,
      moonData.rotation.axialTilt
    );
    const orientation = Transforms.headingPitchRollQuaternion(moonPosition, hpr);
    moonEntityRef.current.orientation = orientation;

    // Enhanced visual effects
    const viewer = viewerRef.current.cesiumElement;
    viewer.scene.globe.enableLighting = true;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.fog.enabled = true;

  }, [moonData, viewerRef]);

  return (
    <Entity
      ref={moonEntityRef}
      name="Moon"
      ellipsoid={{
        radii: new Cartesian3(1737100, 1737100, 1737100),
        material: "https://astrogeology.usgs.gov/search/map/Moon/Geology/Unified_Geologic_Map_of_the_Moon_GIS_v2",
        bumpMap: "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Earth%20-%20Moon/8k_moon_bump.jpg",
        bumpStrength: 0.8,
        silhouetteColor: Color.WHITE.withAlpha(0.8),
        slicePartitions: 128,
        stackPartitions: 128
      }}
    />
  );
};

export default MoonModel;