import * as THREE from 'three';
const GetSatelliteSetting = () =>
{
    const settings = [{
        name: "Parker Solar Probe",
        min_distance: 0.046,
        max_distance: 0.73,
        distance_multiplier: 97, // unknown
        time: 88,
        seconds: 7603200,
        minor_axis: 0.18324846521,
        major_axis: 0.388,
        eccentricity: 0.88144329897,
        inclination: 0.0593411946, // rad
        current_angle: 0,
        orbit_center: new THREE.Vector3(0,0,0),
        current_time: 0,
        synotic_rotation_period: 190080, // thời gian quay quanh trục
        self_rotation_angle: 0.00003305548
    },
    {
        name: "Lucy",
        min_distance: 1.936,
        max_distance: 2.830,
        distance_multiplier: 97, // unknown
        time: 1343,
        seconds: 116035200,
        minor_axis: 2.3407,
        major_axis: 2.383,
        eccentricity: 0.1876,
        inclination: 0.0772133661, // rad
        current_angle: 0,
        orbit_center: new THREE.Vector3(0,0,0),
        current_time: 0,
        synotic_rotation_period: 190080, // thời gian quay quanh trục
        self_rotation_angle: 0.00003305548
    }
    ];
    return settings;
}

export default GetSatelliteSetting;