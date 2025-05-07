import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const GetSun2 = async (sunIntensity, scene) => {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            'assets/models/sun.glb',
            (gltf) => {
                const sun = gltf.scene;

                // Tùy chọn: scale lại model nếu quá to hoặc quá nhỏ
                sun.scale.set(5, 5, 5); // hoặc scale theo nhu cầu
                sun.traverse((child) => {
                    if (child.isMesh) {
                        child.material.emissive = new THREE.Color(0xFFF88F);
                        child.material.emissiveIntensity = sunIntensity;
                    }
                });

                //scene.add(sun);
                resolve(sun);
            },
            undefined,
            (error) => {
                console.error("Error loading sun model:", error);
                reject(error);
            }
        );
    });
};

export default GetSun2;
