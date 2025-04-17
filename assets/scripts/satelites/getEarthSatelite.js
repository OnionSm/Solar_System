import * as THREE from "three"

const GetEarthSatellite = (accelerationOrbit) =>
{
    const earth_satellites = [
        {
          modelPath: 'assets/models/international_space_station_iss.glb',
          scale: 0.1,
          orbitRadius: 5,
          orbitSpeed: 0.002 * accelerationOrbit,
          position: 83,
          mesh: null
        },
        {
          modelPath: 'assets/models/international_space_station_iss.glb',
          scale: 0.2,
          orbitRadius: 8,
          orbitSpeed: 0.0003 * accelerationOrbit,
          position: 97,
          mesh: null
        },
        {
            modelPath: 'assets/models/international_space_station_iss.glb',
            scale: 0.1,
            orbitRadius: 10,
            orbitSpeed: 0.0005 * accelerationOrbit,
            position: 98,
            mesh: null
        },
        {
            modelPath: 'assets/models/international_space_station_iss.glb',
            scale: 0.3,
            orbitRadius: 8,
            orbitSpeed: 0.0009 * accelerationOrbit,
            position: 98,
            mesh: null
        },
        {
            modelPath: 'assets/models/international_space_station_iss.glb',
            scale: 0.1,
            orbitRadius: 9,
            orbitSpeed: 0.0007 * accelerationOrbit,
            position: 98,
            mesh: null
        },
        {
            modelPath: 'assets/models/international_space_station_iss.glb',
            scale: 0.2,
            orbitRadius: 9,
            orbitSpeed: 0.0015 * accelerationOrbit,
            position: 99,
            mesh: null
        },
        {
            modelPath: 'assets/models/international_space_station_iss.glb',
            scale: 0.2,
            orbitRadius: 9,
            orbitSpeed: 0.0012 * accelerationOrbit,
            position: 100,
            mesh: null
        }
    ];
    return earth_satellites;

}

export default GetEarthSatellite;