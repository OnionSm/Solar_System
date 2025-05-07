const GetSunConfig = (accelerationOrbit) => 
{
    const sun_config = [
        {
            modelPath: 'assets/models/sun.glb',
            scale: 697/40/10,
            orbitRadius: 5,
            orbitSpeed: 0.002 * accelerationOrbit,
            position: 0,
            mesh: null
        }
    ]
    return sun_config;
}

export default GetSunConfig;