import * as THREE from 'three';
import GetCamera from './assets/scripts/camera/camera,js';
import GetSun from './assets/scripts/planets/sun.js';
import GetMercury from './assets/scripts/planets/mercury.js';
import GetVenus from './assets/scripts/planets/venus.js';
import GetEarth from './assets/scripts/planets/earth.js';
import GetMars from './assets/scripts/planets/mars.js';
import GetJupiter from './assets/scripts/planets/jupiter.js';
import GetSaturn from './assets/scripts/planets/saturn.js';
import GetUranus from './assets/scripts/planets/uranus.js';
import GetNeptune from './assets/scripts/planets/neptune.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

function LoadComponent() {
    // Scene
    const scene = new THREE.Scene();
    //scene.background = new THREE.Color(0x000000);

  
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

    // Camera
    const camera = GetCamera(0, 1, 50);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // OBJECTS 
    const sun = GetSun();
    const mercury = GetMercury();
    const venus = GetVenus();
    const earth = GetEarth();
    const mars = GetMars();
    const jupiter = GetJupiter();
    const saturn = GetSaturn();
    const uranus = GetUranus();
    const neptune = GetNeptune();

    mercury.position.x = 20;
    venus.position.x = 40;
    earth.position.x = 60;
    mars.position.x = 80;
    jupiter.position.x = 100;
    saturn.position.x = 120;
    uranus.position.x = 140;
    neptune.position.x = 160;

    scene.add(sun);
    scene.add(mercury);
    scene.add(venus);
    scene.add(earth);
    scene.add(mars);
    scene.add(jupiter);
    scene.add(saturn);
    scene.add(uranus);
    scene.add(neptune);


    // ORBITS
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });

    const mercury_orbit_geometry = new THREE.RingGeometry(20, 20.1, 64);
    const venus_orbit_geometry = new THREE.RingGeometry(40, 40.1, 64);
    const earth_orbit_geometry = new THREE.RingGeometry(60, 60.1, 64);
    const mars_orbit_geometry = new THREE.RingGeometry(80, 80.1, 64);
    const jupiter_orbit_geometry = new THREE.RingGeometry(100, 100.1, 64);
    const saturn_orbit_geometry = new THREE.RingGeometry(120, 120.1, 64);
    const uranus_orbit_geometry = new THREE.RingGeometry(140, 140.1, 64);
    const neptune_orbit_geometry = new THREE.RingGeometry(160, 160.1, 64);


    const mercury_orbit = new THREE.Mesh(mercury_orbit_geometry, orbitMaterial);
    const venus_orbit = new THREE.Mesh(venus_orbit_geometry, orbitMaterial);
    const earth_orbit = new THREE.Mesh(earth_orbit_geometry, orbitMaterial);
    const mars_orbit = new THREE.Mesh(mars_orbit_geometry, orbitMaterial);
    const jupiter_orbit = new THREE.Mesh(jupiter_orbit_geometry, orbitMaterial);
    const saturn_orbit = new THREE.Mesh(saturn_orbit_geometry, orbitMaterial);
    const uranus_orbit = new THREE.Mesh(uranus_orbit_geometry, orbitMaterial);
    const neptune_orbit = new THREE.Mesh(neptune_orbit_geometry, orbitMaterial);

    mercury_orbit.rotation.x = Math.PI / 2; 
    venus_orbit.rotation.x = Math.PI / 2; 
    earth_orbit.rotation.x = Math.PI / 2; 
    mars_orbit.rotation.x = Math.PI / 2; 
    jupiter_orbit.rotation.x = Math.PI / 2; 
    saturn_orbit.rotation.x = Math.PI / 2; 
    uranus_orbit.rotation.x = Math.PI / 2; 
    neptune_orbit.rotation.x = Math.PI / 2; 
    
    scene.add(mercury_orbit);
    scene.add(venus_orbit);
    scene.add(earth_orbit);
    scene.add(mars_orbit);
    scene.add(jupiter_orbit);
    scene.add(saturn_orbit);
    scene.add(uranus_orbit);
    scene.add(neptune_orbit);


    // Light
    const light = new THREE.PointLight(0xffffff, 500);
    light.position.set(0, 0, 0);
    scene.add(light);

   // Tạo GridHelper
    const gridSize = 1000; // Kích thước của grid
    const divisions = 1000;  // Số lượng cell của grid
    const gridHelper = new THREE.GridHelper(gridSize, divisions);

    // Thay đổi màu và độ mờ
    gridHelper.material.color.set(0x888888);  // Màu xám nhạt
    gridHelper.material.opacity = 0.1;        // Độ mờ (opacity)
    gridHelper.material.transparent = true;   // Bật tính năng trong suốt

    scene.add(gridHelper);

    // Post-processing: Bloom
    const composer = new EffectComposer(renderer);
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, // strength
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
    function animate() 
    {

        sun.rotation.y += 0.001;
        mercury.rotation.y += 0.01;
        venus.rotation.y += 0.01;
        earth.rotation.y += 0.01;
        mars.rotation.y += 0.01;
        jupiter.rotation.y += 0.01;
        saturn.rotation.y += 0.01;
        uranus.rotation.y += 0.01;
        neptune.rotation.y += 0.01;

        controls.update();
        composer.render(); // Dùng composer để áp dụng hiệu ứng bloom
    }

    renderer.setAnimationLoop(animate);
}
// Hàm thay đổi độ lớn cell dựa trên khoảng cách camera
function updateGridSize() {
    const distance = camera.position.z; // Lấy khoảng cách của camera từ grid
    const scale = Math.max(1, distance / 100);  // Tính toán tỷ lệ
    gridHelper.scale.set(scale, scale, scale); // Áp dụng tỷ lệ cho grid
}

LoadComponent();
