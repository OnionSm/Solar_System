const GetSetting = () => 
{
    const settings = {
        accelerationOrbit: 1,
        acceleration: 1,
        sunIntensity: 1.5,
        time_speed: 86400,
        mercury_orbit_color: 0xFFFFFF,
        venus_orbit_color: 0xFFFFFF,
        earth_orbit_color: 0xFFFFFF,
        mars_orbit_color: 0xFFFFFF,
        jupiter_orbit_color: 0xFFFFFF,
        saturn_orbit_color: 0xFFFFFF,
        uranus_orbit_color: 0xFFFFFF,
        neptune_orbit_color: 0xFFFFFF,
        harley_orbit_color: 0xFFFFFF,
        parker_orbit_color: 0xFFFFFF,
        orbit_opacity: 0.03,
    };
    return settings;
}

export default GetSetting;