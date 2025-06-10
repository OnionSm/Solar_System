import * as THREE from "three"
import CalculateFocalDistance from "../utils/calculateFocalDistance.js";

const loadTexture = new THREE.TextureLoader();
const CreatePlanetDisplay = (planetName, size, position,
    tilt, texture, bump, ring, atmosphere, scene) => {

    let material;
    if (texture instanceof THREE.Material) {
        material = texture;
    } else if (bump) {
        material = new THREE.MeshPhongMaterial({
            map: loadTexture.load(texture),
            bumpMap: loadTexture.load(bump),
            bumpScale: 0.7
        });
    } else {
        material = new THREE.MeshPhongMaterial({
            map: loadTexture.load(texture)
        });
    }

    const name = planetName;
    const geometry = new THREE.SphereGeometry(size, 32, 20);
    const planet = new THREE.Mesh(geometry, material);
    planet.position.x = position.x;
    planet.position.y = position.y;
    const planet3d = new THREE.Object3D;
    const planetSystem = new THREE.Group();
    planetSystem.add(planet);
    let Atmosphere;
    let Ring;

    planet.rotation.z = tilt * Math.PI / 180;


    //add ring
    if (ring) {
        const RingGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 30);
        const RingMat = new THREE.MeshStandardMaterial({
            map: loadTexture.load(ring.texture),
            side: THREE.DoubleSide
        });
        Ring = new THREE.Mesh(RingGeo, RingMat);
        planetSystem.add(Ring);
        Ring.position.x = position;
        Ring.rotation.x = -0.5 * Math.PI;
        Ring.rotation.y = -tilt * Math.PI / 180;
    }

    //add atmosphere
    if (atmosphere) {
        const atmosphereGeom = new THREE.SphereGeometry(size + 0.1, 32, 20);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            map: loadTexture.load(atmosphere),
            transparent: true,
            opacity: 0.4,
            depthTest: true,
            depthWrite: false
        })
        Atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial)

        Atmosphere.rotation.z = 0.41;
        planet.add(Atmosphere);
    }


    planet3d.add(planetSystem);
    scene.add(planet3d);

    return { name, planet, planet3d, Atmosphere, planetSystem, Ring };
}

export default CreatePlanetDisplay;