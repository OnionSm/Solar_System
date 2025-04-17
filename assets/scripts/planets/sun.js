import * as THREE from "three"
const loadTexture = new THREE.TextureLoader();

const GetSun = (radius = 5, sunIntensity) => 
{
    const sunGeom = new THREE.SphereGeometry(radius, 64, 32);

    // Tải texture bằng TextureLoader
    const textureLoader = new THREE.TextureLoader();
    const sunMat = new THREE.MeshStandardMaterial({
        emissive: 0xFFF88F,
        emissiveMap: loadTexture.load("assets/sprites/sun.jpg"),
        emissiveIntensity: sunIntensity
    });
    
    //const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } ); 
    const sun = new THREE.Mesh(sunGeom, sunMat);

    return sun;
}

export default GetSun;