const GetJupiterMoons = (accelerationOrbit) =>
{
    const jupiterMoons = [
        {
          size: 1.6,
          texture: "assets/sprites/jupiterIo.jpg",
          orbitRadius: 20,
          orbitSpeed: 0.0005 * accelerationOrbit
        },
        {
          size: 1.4,
          texture: "assets/sprites/jupiterEuropa.jpg",
          orbitRadius: 24,
          orbitSpeed: 0.00025 * accelerationOrbit
        },
        {
          size: 2,
          texture: "assets/sprites/jupiterGanymede.jpg",
          orbitRadius: 28,
          orbitSpeed: 0.000125 * accelerationOrbit
        },
        {
          size: 1.7,
          texture: "assets/sprites/jupiterCallisto.jpg",
          orbitRadius: 32,
          orbitSpeed: 0.00006 * accelerationOrbit
        }
      ];
    return jupiterMoons;
}

export default GetJupiterMoons

