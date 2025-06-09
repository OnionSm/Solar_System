const GetSetting = () => {
    const settings = {
        accelerationOrbit: 1,
        acceleration: 1,
        sunIntensity: 1.5,
        time_speed: 1,
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
        meteors_settings: meteors_settings,
        music_setting: music_setting
    };
    return settings;
}

const meteors_settings = {
    spawnInterval: 0.5, // Tần suất sinh sao băng
    angleMin: 110, // Góc nhỏ nhất (độ)
    angleMax: 130, // Góc lớn nhất (độ)
    speed: 0.6, // Tốc độ sao băng
    scale: 1.0, // Tỉ lệ kích thước
    tailLength: 20, // Độ dài đuôi sao băng (số điểm)
    spawnYMin: 0.1, // Vị trí Y nhỏ nhất khi sinh sao băng
    spawnYHeight: 0.8, // Độ cao vùng sinh sao băng theo Y
    maxMeteors: 100
}

const music_setting = {
    volume: 0.1,
    isPlaying: true,
    loop: false
}

export default GetSetting;