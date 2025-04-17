import * as THREE from "three"
const GetEarthMoon = (accelerationOrbit) =>
{
    const earthMoon = [{
        size: 1.6,
        texture: "assets/sprites/2k_moon.jpg",
        bump: "assets/sprites/moonbump.jpg",
        orbitSpeed: 0.001 * accelerationOrbit,
        orbitRadius: 10
      }]
    return earthMoon;
}

export default GetEarthMoon;
  