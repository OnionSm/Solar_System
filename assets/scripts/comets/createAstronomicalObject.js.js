import * as THREE from "three"
import CalculateFocalDistance from "../utils/calculateFocalDistance.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loadTexture = new THREE.TextureLoader();

const CreateAstronomicalObject = async(astronomical_object_name, size, distance_multiplier, model_path, tilt, texture, bump, ring, atmosphere, moons, scene,
    minor_axis, major_axis, min_distance, max_distance, orbit_color, orbit_opacity, inclination) => {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(model_path);
    const astronomical_object = gltf.scene;

    astronomical_object.rotation.z = tilt * Math.PI / 180;
    astronomical_object.scale.set(size, size, size);

    const name = astronomical_object_name;
    const astronomical_object3d = new THREE.Object3D();
    const astronomical_objectSystem = new THREE.Group();
    astronomical_objectSystem.add(astronomical_object);

    let Atmosphere;
    let Ring;

    // Tính toán quỹ đạo Ellipse
    const focalDistance = CalculateFocalDistance(major_axis, minor_axis) * distance_multiplier;
    const orbitPath = new THREE.EllipseCurve(-focalDistance, 0,
        major_axis * distance_multiplier, minor_axis * distance_multiplier,
        0, 2 * Math.PI,
        false,
        0
    );
    const orbit_center = new THREE.Vector3(focalDistance, 0, 0);
    astronomical_object.position.x = max_distance * distance_multiplier;

    const pathPoints = orbitPath.getPoints(300);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: orbit_color, transparent: true, opacity: orbit_opacity });
    const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    // orbit.rotation.z = inclination; 
    astronomical_objectSystem.add(orbit);

    // Thêm vành đai (Ring)
    if (ring) {
        const RingGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 30);
        const RingMat = new THREE.MeshStandardMaterial({
            map: textureLoader.load(ring.texture),
            side: THREE.DoubleSide
        });
        Ring = new THREE.Mesh(RingGeo, RingMat);
        astronomical_objectSystem.add(Ring);
        Ring.position.x = max_distance * distance_multiplier;
        Ring.rotation.x = -0.5 * Math.PI;
        Ring.rotation.y = -tilt * Math.PI / 180;
    }

    // Thêm khí quyển (Atmosphere)
    if (atmosphere) {
        const atmosphereGeom = new THREE.SphereGeometry(1.1, 32, 20); // scale tạm, nếu GLB scale là 1
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load(atmosphere),
            transparent: true,
            opacity: 0.4,
            depthTest: true,
            depthWrite: false
        });
        Atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial);
        Atmosphere.rotation.z = 0.41;
        astronomical_object.add(Atmosphere);
    }

    // Thêm mặt trăng (moons)
    if (moons) {
        moons.forEach(moon => {
            let moonMaterial;
            if (moon.bump) {
                moonMaterial = new THREE.MeshStandardMaterial({
                    map: textureLoader.load(moon.texture),
                    bumpMap: textureLoader.load(moon.bump),
                    bumpScale: 0.5
                });
            } else {
                moonMaterial = new THREE.MeshStandardMaterial({
                    map: textureLoader.load(moon.texture)
                });
            }

            const moonGeometry = new THREE.SphereGeometry(moon.size, 32, 20);
            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
            const moonOrbitDistance = 2.0; // tùy chỉnh theo kích thước glb
            moonMesh.position.set(moonOrbitDistance + astronomical_object.position.x, 0, 0);
            astronomical_objectSystem.add(moonMesh);
            moon.mesh = moonMesh;
        });
    }

    // Thêm vào scene
    astronomical_object3d.add(astronomical_objectSystem);
    scene.add(astronomical_object3d);


    astronomical_objectSystem.rotation.z = inclination;

    return { name, astronomical_object, astronomical_object3d, Atmosphere, moons, astronomical_objectSystem, Ring, orbit_center, orbitMaterial };
}

export default CreateAstronomicalObject;