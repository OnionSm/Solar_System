import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/Addons.js";


const loadTexture = new THREE.TextureLoader();
const noise = new SimplexNoise();

const GetSun2 = (radius = 5, sunIntensity) => 
{
    const sunGeom = new THREE.SphereGeometry(radius, 128, 64); // tăng độ phân giải để noise mịn

    // Áp dụng noise lên geometry
    const position = sunGeom.attributes.position;
    for (let i = 0; i < position.count; i++) 
    {
        const vertex = new THREE.Vector3().fromBufferAttribute(position, i);
        const normal = vertex.clone().normalize();
        
        // Tăng tần số (scale) và biên độ của noise
        const noiseVal = noise.noise3d(vertex.x * 1, vertex.y * 0.2, vertex.z * 0.2);
        vertex.addScaledVector(normal, noiseVal * 0.0); // 0.5 = độ biến dạng

        position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    position.needsUpdate = true;
    sunGeom.computeVertexNormals();

    const sunMat = new THREE.MeshStandardMaterial({
        emissive: 0xFFF88F,
        emissiveMap: loadTexture.load("assets/sprites/sun.jpg"),
        emissiveIntensity: 1
    });

    const sun = new THREE.Mesh(sunGeom, sunMat);
    return sun;
};

export default GetSun2;
