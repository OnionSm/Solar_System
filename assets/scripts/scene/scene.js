import * as THREE from "three"

const GetScene = () =>
{
    const scene = new THREE.Scene();
        {
    
            const loader = new THREE.CubeTextureLoader();
            const texture = loader.load( [
                './assets/sprites/8k_stars.jpg',
                './assets/sprites/8k_stars.jpg',
                './assets/sprites/8k_stars.jpg',
                './assets/sprites/8k_stars.jpg',
                './assets/sprites/8k_stars.jpg',
                './assets/sprites/8k_stars.jpg',
            ] );
            scene.background = texture;
        }
    return scene;
}

export default GetScene;