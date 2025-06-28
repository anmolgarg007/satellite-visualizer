// MoonModel.js
import React, { useEffect, useRef } from "react";
import { Entity, Viewer } from "resium";
import { Cartesian3, Color, HeadingPitchRoll, Transforms, Ellipsoid, Quaternion } from "cesium";

// More accurate astronomical values
const moonRadius = 1737100; // meters (more precise average radius)
const moonDistance = 384400000; // average Earth-Moon distance
const moonOrbitInclination = 0.0898; // radians (~5.14° inclination to ecliptic)
const moonAxialTilt = 0.0269; // radians (~1.54° axial tilt)

export default function MoonModel({ viewerRef }) {
  const moonEntityRef = useRef();

  // Animation: Moon orbit and rotation
  useEffect(() => {
    let animationId;
    let start = Date.now();

    function animate() {
      if (!viewerRef.current || !moonEntityRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      const elapsed = (Date.now() - start) / 1000; // seconds

      // Moon orbit parameters
      const orbitPeriodSeconds = 27.321661 * 24 * 3600; // sidereal month in seconds
      const orbitAngle = (elapsed / orbitPeriodSeconds) * 2 * Math.PI;

      // Moon position in Earth-centered frame with inclination
      const moonX = moonDistance * Math.cos(orbitAngle);
      const moonY = moonDistance * Math.sin(orbitAngle) * Math.cos(moonOrbitInclination);
      const moonZ = moonDistance * Math.sin(orbitAngle) * Math.sin(moonOrbitInclination);

      // Update position
      const moonPosition = Cartesian3.fromElements(moonX, moonY, moonZ);
      moonEntityRef.current.position = moonPosition;

      // Moon rotation (synchronous rotation with libration effects)
      const rotationAngle = orbitAngle; // main synchronous rotation
      
      // Add small libration effects (moon wobble)
      const librationLongitude = 0.03 * Math.sin(elapsed / (orbitPeriodSeconds / 4));
      const librationLatitude = 0.03 * Math.sin(elapsed / (orbitPeriodSeconds / 3.5));
      
      // Create orientation with axial tilt and librations
      const hpr = new HeadingPitchRoll(
        rotationAngle + librationLongitude,
        moonAxialTilt + librationLatitude,
        0
      );
      
      const orientation = Transforms.headingPitchRollQuaternion(
        moonPosition,
        hpr
      );
      moonEntityRef.current.orientation = orientation;

      // Update distance-based scale for more realistic appearance
      const viewer = viewerRef.current.cesiumElement;
      if (viewer) {
        const cameraPosition = viewer.camera.position;
        const distance = Cartesian3.distance(cameraPosition, moonPosition);
        const scale = Math.min(1, distance / (moonDistance * 0.1));
        moonEntityRef.current.ellipsoid.radii = new Cartesian3(
          moonRadius * scale,
          moonRadius * scale,
          moonRadius * scale
        );
      }

      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => cancelAnimationFrame(animationId);
  }, [viewerRef]);

  return (
    <Entity
      ref={moonEntityRef}
      name="Moon"
      ellipsoid={{
        radii: new Cartesian3(moonRadius, moonRadius, moonRadius),
        material: "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Earth%20-%20Moon/8k_moon.jpg",
        // Alternative high-res texture: "https://www.solarsystemscope.com/textures/download/8k_moon.jpg"
        silhouetteColor: Color.WHITE.withAlpha(0.5),
        slicePartitions: 64,
        stackPartitions: 64
      }}
      description={
        `<h1>Moon</h1>
        <p>Radius: ${(moonRadius/1000).toFixed(0)} km</p>
        <p>Average distance from Earth: ${(moonDistance/1000).toFixed(0)} km</p>
        <p>Orbital period: 27.3 days (sidereal)</p>`
      }
    />
  );
}