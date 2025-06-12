import * as THREE from 'three';
import * as dat from 'dat.gui';
import GetCamera from '../camera/camera.js';
import GetSun from '../planets/sun.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import GetEarthMaterial from '../textures/earthTexture.js';
import GetEarthMoon from '../moons/getEarthMoon.js';
import CreatePlanet from '../planets/createPlanet.js';
import GetMarsMoon from '../moons/getMarsMoons.js';
import LoadObject from '../utils/loadObject.js';
import GetJupiterMoons from '../moons/getJupiterMoons.js';
import GetScene from '../scene/scene.js';

import GetSetting from '../configs/setting.js';
import LoadAsteroids from '../asteroids/loadAsteroids.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { OutlinePass } from 'three/examples/jsm/Addons.js';
import GetSun2 from '../planets/sun2.js';
import GetEarthSatellite from '../satelites/getEarthSatelite.js';
import GetSunConfig from '../stars/getSunConfig.js';
import GetPlanetSetting from '../configs/planet_configs.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { Scene, Vector3 } from 'three/webgpu';
import CreatePlanetDisplay from '../planets/createPlanetDisplay.js';

import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';



const SolarSystem = () => {
    const time = { value: 0 };
    // Scene
    const scene = new Scene();
    const geometry = new THREE.PlaneGeometry(10000, 10000);

    // Trục X
    const points = [new THREE.Vector3(-10000, 0, 0), new THREE.Vector3(10000, 0, 0)];
    const geometrypoint = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Line(geometrypoint, material));

    // Mặt phẳng phản chiếu
    const reflector = new Reflector(geometry, {
        clipBias: 0.009,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0x889999,
        recursion: 1,
        mixBlur: 0.9,
        mixStrength: 0.05,
        mirror: 0.01
    });
    reflector.material.transparent = true;
    reflector.material.opacity = 0.1;
    reflector.material.blending = THREE.AdditiveBlending;
    reflector.rotation.x = -Math.PI / 2;
    reflector.position.y = 0;
    scene.add(reflector);

    // SETTING
    const settings = GetSetting();

    // Camera
    const cameraPositions = [
        new THREE.Vector3(0.1276, 3.67, 3.42),
        new THREE.Vector3(8.209428352980166, 3.64511652557355, 4.99629942519925),
        new THREE.Vector3(11.464957988445164, 7.634503777378075, 5.102745063356066),
        new THREE.Vector3(21.832809034769713, 8.687793615412364, 5.589965545377737),
        new THREE.Vector3(42.23767534971387, 31.642780754362217, 19.240415925296336),
        new THREE.Vector3(60.23767534971387, 35.642780754362217, 40.240415925296336),

        new THREE.Vector3(120.59451048290639, 74.90625302769507, 42.97875509332253),
        new THREE.Vector3(198.53961871359198, 95.81748510867746, 51.06590576003864),
        new THREE.Vector3(595.2696293446415, 934.3652819365442, 663.713483254629),
    ];
    let currentPositionIndex = 0;
    const camera = GetCamera(
        cameraPositions[currentPositionIndex].x,
        cameraPositions[currentPositionIndex].y,
        cameraPositions[currentPositionIndex].z
    );

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Controls
    // Khởi tạo controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Vô hiệu hóa hoàn toàn thao tác chuột
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;


    // Giữ enableDamping nếu muốn mượt khi chuyển camera bằng phím
    controls.enableDamping = true;
    controls.dampingFactor = 0.75;
    controls.screenSpacePanning = false;

    // Postprocessing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePass.edgeStrength = 3;
    outlinePass.edgeGlow = 1;
    outlinePass.visibleEdgeColor.set(0xffffff);
    outlinePass.hiddenEdgeColor.set(0x190a05);
    composer.addPass(outlinePass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
    bloomPass.threshold = 0.75;
    bloomPass.radius = 1.5;
    composer.addPass(bloomPass);

    // Ambient Light
    scene.add(new THREE.AmbientLight(0x222222, 6));

    // Mouse movement
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    window.addEventListener('mousemove', (event) => {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }, false);

    // Close info
    window.closeInfo = () => {
        var info = document.getElementById('planetInfo');
        info.style.display = 'none';
        settings.accelerationOrbit = 1;
        isZoomingOut = true;
        controls.target.set(0, 0, 0);
    };

    // Thông số các hành tinh
    const planetConfigs = [{
            key: 'Mercury',
            name: 'Mercury',
            radius: 1,
            pos: new THREE.Vector3(0, 1, 0),
            map: "assets/sprites/mercury.jpg",
            bump: "assets/sprites/mercurybump.jpg",
            sizeText: '4.880 km',
            light: { color: 0xFDFFD3, intensity: 1, distance: 10, decay: 0.1, pos: [1, 1, 2] }
        },
        {
            key: 'Mars',
            name: 'Mars',
            radius: 1.3913,
            pos: new THREE.Vector3(6, 1.3913, 0),
            map: "assets/sprites/marsmap.jpg",
            bump: "assets/sprites/marsbump.jpg",
            sizeText: '6.779 km',
            light: { color: 0xFDFFD3, intensity: 1, distance: 100, decay: 0.1, pos: [7.3913, 7.3913, 14.7826] }
        },
        {
            key: 'Venus',
            name: 'Venus',
            radius: 2.4813,
            pos: new THREE.Vector3(13, 2.4813, 0),
            map: "assets/sprites/venusmap.jpg",
            bump: "assets/sprites/venusbump.jpg",
            sizeText: '12.104 km'
        },
        {
            key: 'Earth',
            name: 'Earth',
            radius: 2.615,
            pos: new THREE.Vector3(22, 2.615, 0),
            map: "assets/sprites/2k_earth_daymap.jpg",
            atmosphere: "assets/sprites/earth_atmosphere.jpg",
            sizeText: '12.742 km'
        },
        {
            key: 'Neptune',
            name: 'Neptune',
            radius: 9.963,
            pos: new THREE.Vector3(40, 9.963, 0),
            map: "assets/sprites/neptune.jpg",
            sizeText: '49.244 km'
        },
        {
            key: 'Uranus',
            name: 'Uranus',
            radius: 10.479,
            pos: new THREE.Vector3(70, 10.479, 0),
            map: "assets/sprites/uranus.jpg",
            sizeText: '50.724 km'
        },
        {
            key: 'Saturn',
            name: 'Saturn',
            radius: 24.7355,
            pos: new THREE.Vector3(120, 24.7355, 0),
            map: "assets/sprites/saturnmap.jpg",
            ring: { innerRadius: 29.7355, outerRadius: 34.7355, texture: "assets/sprites/saturn_ring.png" },
            sizeText: '116.460 km',
            light: { color: 0xFDFFD3, intensity: 1, distance: 200, decay: 0.1, pos: [120, 120, 100] }
        },
        {
            key: 'Jupiter',
            name: 'Jupiter',
            radius: 29.2734,
            pos: new THREE.Vector3(200, 29.2734, 0),
            map: "assets/sprites/jupiter.jpg",
            sizeText: '139.820 km',
            light: { color: 0xFDFFD3, intensity: 1, distance: 100, decay: 0.1, pos: [50, 50, 50] }
        },
        {
            key: 'Sun',
            name: 'Sun',
            radius: 285.2459,
            pos: new THREE.Vector3(600, 285.2459, 0),
            isSun: true,
            sizeText: '1.392.020 km'
        }
    ];

    // Tạo các hành tinh
    const planetObjects = {};
    planetConfigs.forEach(cfg => {
        if (cfg.isSun) {
            const { sun, sunMat } = GetSun(cfg.radius, 0.8);
            sun.position.copy(cfg.pos);
            scene.add(sun);
            planetObjects[cfg.key] = { planet: sun };
        } else {
            planetObjects[cfg.key] = CreatePlanetDisplay(
                cfg.name, cfg.radius, cfg.pos, 0, cfg.map, cfg.bump, cfg.ring, cfg.atmosphere, scene
            );
        }
    });

    // Thêm PointLight cho các hành tinh có cấu hình ánh sáng
    planetConfigs.forEach(cfg => {
        if (cfg.light) {
            const light = new THREE.PointLight(cfg.light.color, cfg.light.intensity, cfg.light.distance, cfg.light.decay);
            light.position.set(...cfg.light.pos);
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.shadow.camera.near = 10;
            light.shadow.camera.far = 20;
            scene.add(light);
        }
    });

    // Tạo text tên và kích thước cho các hành tinh
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        planetConfigs.forEach(cfg => {
            // Text tên hành tinh
            const textGeometryName = new TextGeometry(cfg.name, {
                font: font,
                size: 0.2 * cfg.radius,
                depth: 0.05,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.001,
                bevelSize: 0.001,
                bevelOffset: 0,
                bevelSegments: 20
            });
            textGeometryName.center();
            const textMeshName = new THREE.Mesh(textGeometryName, material);
            textMeshName.position.x = cfg.pos.x;
            textMeshName.position.y = 2.5 * cfg.radius;
            scene.add(textMeshName);

            // Text kích thước
            const textGeometrySize = new TextGeometry(cfg.sizeText, {
                font: font,
                size: 0.1 * cfg.radius,
                depth: 0.05,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.001,
                bevelSize: 0.001,
                bevelOffset: 0,
                bevelSegments: 20
            });
            textGeometrySize.center();
            const textMeshSize = new THREE.Mesh(textGeometrySize, material);
            textMeshSize.position.x = cfg.pos.x;
            textMeshSize.position.y = 2.3 * cfg.radius;
            scene.add(textMeshSize);
        });
    });

    // Shadow settings
    renderer.shadowMap.enabled = true;
    Object.values(planetObjects).forEach(obj => {
        if (obj.planet) {
            obj.planet.castShadow = true;
            obj.planet.receiveShadow = true;
        }
        if (obj.Atmosphere) {
            obj.Atmosphere.castShadow = true;
            obj.Atmosphere.receiveShadow = true;
        }
        if (obj.Ring) {
            obj.Ring.receiveShadow = true;
        }
    });
    let cameraTargetPosition = cameraPositions[currentPositionIndex].clone();
    document.addEventListener('keydown', function(event) {
        if (event.key === "ArrowLeft") {
            currentPositionIndex = (currentPositionIndex - 1 + cameraPositions.length) % cameraPositions.length;
            cameraTargetPosition.copy(cameraPositions[currentPositionIndex]);
            // Cập nhật điểm nhìn của controls về hành tinh tương ứng
            controls.target.copy(planetConfigs[currentPositionIndex].pos);
        }
        if (event.key === "ArrowRight") {
            currentPositionIndex = (currentPositionIndex + 1) % cameraPositions.length;
            cameraTargetPosition.copy(cameraPositions[currentPositionIndex]);
            controls.target.copy(planetConfigs[currentPositionIndex].pos);
        }
    });
    // // Animation
    function animate() {
        planetObjects["Mercury"].planet.rotateY(0.01);
        planetObjects["Venus"].planet.rotateY(0.01);
        planetObjects["Earth"].planet.rotateY(0.01);
        planetObjects["Mars"].planet.rotateY(0.01);
        planetObjects["Saturn"].planet.rotateY(0.01);
        planetObjects["Jupiter"].planet.rotateY(0.01);
        planetObjects["Uranus"].planet.rotateY(0.01);
        planetObjects["Neptune"].planet.rotateY(0.01);

        // Di chuyển mượt camera đến vị trí đích
        camera.position.lerp(cameraTargetPosition, 0.01);


        if (planetObjects.Sun && planetObjects.Sun.planet) {
            planetObjects.Sun.planet.rotateY(0.001 * settings.acceleration);
        }
        controls.update();
        requestAnimationFrame(animate);
        composer.render();
    }
    animate();

    // Resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
    return {
        cleanup: () => {
            // Dọn dẹp event listeners, animation loops, v.v.
            renderer.dispose();
            controls.dispose();
        }
    };

};

export default SolarSystem