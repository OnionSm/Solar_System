import * as THREE from "three";

const GetCamera = (x = 0, y = 0, z = 0) => {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
    console.log(x, y, z);
    return camera;
}

export default GetCamera;