import React, { useState, useEffect, useRef } from "react";
import { Viewer, Entity, CameraFlyTo } from "resium";
import {
  Cartesian3,
  Color,
  Ion,
  createWorldTerrainAsync,
  IonImageryProvider,
  EllipsoidTerrainProvider,
  UrlTemplateImageryProvider,
  Math as CesiumMath,
  TileMapServiceImageryProvider
} from "cesium";
import MoonModel from "../components/Moon/MoonModel.js";
import MoonOrbitTrail from "../components/Moon/MoonOrbitTrail.js";
import MoonUI from "../components/Moon/MoonUI.js";
import "../Css/GlobalViewer.css";

// Use environment variables in production
const CESIUM_ION_TOKEN = process.env.REACT_APP_CESIUM_ION_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMTgyMjU3YS1iZjVjLTRiYzktOTRhZS02NzJmMWMxM2UzYWUiLCJpZCI6MzA0MDAwLCJpYXQiOjE3NDc3MzQ1Mjd9.pGIRyJ7EW4D7Gm_x9g1G1kCG-hD1D2nRQfUOLgTjMkk';

const GlobeViewer = () => {
  const viewerRef = useRef(null);
  const [moonData, setMoonData] = useState(null);
  const [moonPositions, setMoonPositions] = useState([]);
  const [currentView, setCurrentView] = useState('earth');
  const [loading, setLoading] = useState(true);
  const [terrainProvider, setTerrainProvider] = useState(new EllipsoidTerrainProvider());
  const [imageryProvider, setImageryProvider] = useState(null);
  const [imageryError, setImageryError] = useState(false);
  const [terrainError, setTerrainError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeGlobe = async () => {
      try {
        Ion.defaultAccessToken = CESIUM_ION_TOKEN;

        // Try loading Cesium World Imagery (Asset ID 3845)
        try {
          const imagery = await IonImageryProvider.fromAssetId(3845, {
            accessToken: CESIUM_ION_TOKEN
          });
          if (isMounted) {
            setImageryProvider(imagery);
            setImageryError(false);
          }
        } catch (e) {
          console.warn("Falling back to OpenStreetMap imagery");
          if (isMounted) {
            setImageryProvider(new UrlTemplateImageryProvider({
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              subdomains: ['a', 'b', 'c']
            }));
            setImageryError(true);
          }
        }

        // Try loading Cesium World Terrain
        try {
          const terrain = await createWorldTerrainAsync({
            requestWaterMask: true,
            requestVertexNormals: true,
          });
          if (isMounted) {
            setTerrainProvider(terrain);
            setTerrainError(false);
          }
        } catch (e) {
          console.warn("Falling back to ellipsoid terrain");
          if (isMounted) {
            setTerrainProvider(new EllipsoidTerrainProvider());
            setTerrainError(true);
          }
        }

        // Load moon data
        try {
          const response = await fetch('/api/moon');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (isMounted) processMoonData(data);
        } catch (error) {
          console.error("Using mock moon data due to:", error);
          if (isMounted) processMoonData(getMockMoonData());
        }

      } catch (error) {
        console.error("Error initializing globe:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const processMoonData = (data) => {
      const moon = {
        position: {
          x: data.position?.x || 384400000,
          y: data.position?.y || 0,
          z: data.position?.z || 0,
        },
        rotation: {
          longitude: data.rotation?.longitude || 0,
          latitude: data.rotation?.latitude || 0,
          axialTilt: data.rotation?.axialTilt || 0.0269,
        },
        distance: data.distance || 384400000,
        phase: data.phase || "Waxing Gibbous",
        illumination: data.illumination || 0.78,
        age: data.age || 10.5,
        radius: data.radius || 1737100,
      };

      const positions = Array.from({ length: 360 }, (_, i) => {
        const angle = CesiumMath.toRadians(i);
        return new Cartesian3(
          moon.distance * Math.cos(angle),
          moon.distance * Math.sin(angle),
          0
        );
      });

      setMoonData(moon);
      setMoonPositions(positions);
    };

    const getMockMoonData = () => ({
      position: { x: 384400000, y: 0, z: 0 },
      rotation: { longitude: 0, latitude: 0, axialTilt: 0.0269 },
      distance: 384400000,
      phase: "Waxing Gibbous",
      illumination: 0.78,
      age: 10.5,
      radius: 1737100,
    });

    initializeGlobe();

    return () => { isMounted = false; };
  }, []);

  const flyToMoon = () => {
    if (viewerRef.current?.cesiumElement && moonData) {
      viewerRef.current.cesiumElement.camera.flyTo({
        destination: Cartesian3.fromElements(
          moonData.position.x * 0.9,
          moonData.position.y * 0.9,
          moonData.position.z * 0.9
        ),
        orientation: {
          heading: 0.0,
          pitch: -Math.PI / 2,
          roll: 0.0,
        },
        duration: 3,
        maximumHeight: moonData.distance * 1.5,
      });
      setCurrentView('moon');
    }
  };

  const flyToEarth = () => {
    if (viewerRef.current?.cesiumElement) {
      viewerRef.current.cesiumElement.camera.flyTo({
        destination: Cartesian3.fromDegrees(0, 0, 20000000),
        orientation: {
          heading: 0.0,
          pitch: -Math.PI / 2,
          roll: 0.0,
        },
        duration: 3,
      });
      setCurrentView('earth');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Initializing 3D environment...</p>
      </div>
    );
  }

  return (
    <div className="globe-container">
      {imageryError && (
        <div className="warning-banner">
          Warning: Using OpenStreetMap instead of premium imagery
        </div>
      )}
      {terrainError && (
        <div className="warning-banner">
          Warning: Using basic terrain instead of 3D terrain
        </div>
      )}

      <Viewer
        full
        ref={viewerRef}
        baseLayerPicker={false}
        timeline={false}
        animation={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        homeButton={false}
        skyBox={false}
        skyAtmosphere={false}
        imageryProvider={imageryProvider}
        terrainProvider={terrainProvider}
      >
        <Entity name="Earth" position={Cartesian3.ZERO} />

        {moonData && <MoonModel viewerRef={viewerRef} moonData={moonData} />}
        <MoonOrbitTrail positions={moonPositions} />

        <CameraFlyTo
          duration={0}
          destination={Cartesian3.fromDegrees(0, 0, 20000000)}
        />
      </Viewer>

      {moonData && (
        <MoonUI
          moonData={moonData}
          onViewChange={currentView === 'moon' ? flyToEarth : flyToMoon}
          currentView={currentView}
        />
      )}
    </div>
  );
};

export default GlobeViewer;