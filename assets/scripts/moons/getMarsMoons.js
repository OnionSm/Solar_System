import * as THREE from "three"

const GetMarsMoon = (accelerationOrbit) =>
{
    const marsMoons = [
        {
          modelPath: 'assets/scripts/models/moons/phobos.glb',
          scale: 0.1,
          orbitRadius: 5,
          orbitSpeed: 0.002 * accelerationOrbit,
          position: 100,
          mesh: null
        },
        {
          modelPath: 'assets/scripts/models/moons/deimos.glb',
          scale: 0.1,
          orbitRadius: 9,
          orbitSpeed: 0.0005 * accelerationOrbit,
          position: 120,
          mesh: null
        }
    ];
    return marsMoons;

}

export default GetMarsMoon;