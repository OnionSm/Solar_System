import * as THREE from 'three';
const GetCometSetting = () =>
{
    const settings = [{
        name: "Harley",
        min_distance: 0.59278,
        max_distance: 35.14,
        distance_multiplier: 97, // unknown
        time: 27265.5,
        seconds: 2355739200,
        minor_axis: 4.564021,
        major_axis: 17.737,
        eccentricity: 0.966327,
        inclination: 2.8267352565, // rad
        current_angle: Math.PI,
        orbit_center: new THREE.Vector3(0,0,0),
        current_time: 0,
        synotic_rotation_period: 190080, // thời gian quay quanh trục
        self_rotation_angle: 0.00003305548
    }
    ];
    return settings;
}

export default GetCometSetting;