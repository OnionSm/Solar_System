import * as THREE from 'three';
import GetCamera from './assets/scripts/camera/camera,js';
import GetSun from './assets/scripts/planets/sun.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

function init() {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    const camera = GetCamera(0, 1, 10);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Sun (Object)
    const sun = GetSun();
    scene.add(sun);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 2);
    scene.add(light);

    // Grid
    const gridHelper = new THREE.GridHelper(10000, 10000);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Post-processing: Bloom
    const composer = new EffectComposer(renderer);
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        2, // strength
        1, // radius
        0 // threshold
    );

    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Handle resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        composer.setSize(width, height);
    });

    // Animation loop
    function animate() {
        sun.rotation.z += 0.01;
        sun.rotation.y += 0.01;

        controls.update();
        composer.render(); // Dùng composer để áp dụng hiệu ứng bloom
    }

    renderer.setAnimationLoop(animate);
}

init();
