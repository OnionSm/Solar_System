import * as THREE from 'three';
import * as dat from 'dat.gui';
import { Pane } from 'tweakpane';
import Stats from 'stats.js';
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
import CalculatePlanetPosition from '../utils/calculatePlanetPosition.js';
import GetPlanetData from '../configs/planetData.js';
import getTrueAnomalyAfterTime from '../utils/getAnomalyAngle.js';
import { timerDelta } from 'three/tsl';
import GetCometSetting from '../configs/comet_configs.js';
import CreateAstronomicalObject from '../comets/createAstronomicalObject.js';
import GetSatelliteSetting from '../configs/satellite_configs.js';
import MeteorShower from '../effects/meteorShower.js';

const SolarSystem2 = async() => {


    const time = { value: 0 };
    // Scene
    const scene = GetScene();
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: memory
    //document.body.appendChild(stats.dom);


    // const axesHelper = new THREE.AxesHelper(50); // chiều dài trục là 5 đơn vị
    // scene.add(axesHelper);

    const clock = new THREE.Clock();

    // SETTING
    const settings = GetSetting();
    const planetSettings = GetPlanetSetting();
    const cometSettings = GetCometSetting();
    const satelliteSettings = GetSatelliteSetting();

    const pane = new Pane();
    const guiContainer = document.getElementById('gui-container');
    guiContainer.appendChild(pane.element);



    // Pane cho FPS ở bên trái
    const fpsPane = new Pane({
        title: 'Performance'
    });
    guiContainer.appendChild(fpsPane.element);

    // Đặt FPS pane ở bên trái
    fpsPane.element.style.position = 'fixed';
    fpsPane.element.style.top = '10px';
    fpsPane.element.style.left = '10px';
    fpsPane.element.style.width = '200px';

    // FPS
    const fpsData = {
        fps: 0
    };

    // Thêm FPS monitor với addBinding
    const fpsNumberBinding = fpsPane.addBinding(fpsData, 'fps', {
        readonly: true,
        label: 'FPS',
        min: 0,
        max: 165
    });
    // Binding hiển thị dạng graph
    const fpsGraphBinding = fpsPane.addBinding(fpsData, 'fps', {
        readonly: true,
        label: 'FPS (Graph)',
        view: 'graph',
        min: 0,
        max: 165,
        interval: 100
    });


    // Biến để tính FPS
    let lastTime = performance.now();
    let frameCount = 0;


    function formatDuration(seconds) {
        const units = [
            { label: 'năm', seconds: 31536000 },
            { label: 'tháng', seconds: 2592000 },
            { label: 'tuần', seconds: 604800 },
            { label: 'ngày', seconds: 86400 },
            { label: 'giờ', seconds: 3600 },
            { label: 'phút', seconds: 60 },
            { label: 'giây', seconds: 1 },
        ];

        let result = '';
        for (const unit of units) {
            const value = Math.floor(seconds / unit.seconds);
            if (value > 0) {
                result += `${value} ${unit.label} `;
                seconds %= unit.seconds;
            }
        }
        return result.trim();
    }
    const PARAMS = {
        time: '1 giây',
    };

    pane.addBinding(PARAMS, 'time', {
        readonly: true,
        interval: 1000,
    });

    pane.addBinding(settings, 'time_speed', {
        label: 'Time Speed',
        min: 1,
        max: 94608000,
        step: 1,
    }).on('change', (ev) => {
        PARAMS.time = formatDuration(ev.value);
    });



    pane.addBinding(settings, 'accelerationOrbit', { min: 0, max: 10, step: 1 });
    pane.addBinding(settings, 'acceleration', { min: 0, max: 10, step: 1 });
    pane.addBinding(settings, 'sunIntensity', { min: 0.1, max: 10, step: 0.1 })
        .on('change', (ev) => {
            sunMat.emissiveIntensity = ev.value;
        });



    // Tạo folder "Planet Orbit Colors"
    const orbitColorFolder = pane.addFolder({
        title: 'Planet Orbit Colors',
        expanded: true,
    });
    orbitColorFolder.addBinding(settings, 'orbit_opacity', { min: 0, max: 0.1, step: 0.01 }).on('change', (ev) => {
        mercury.orbitMaterial.opacity = ev.value;
        venus.orbitMaterial.opacity = ev.value;
        earth.orbitMaterial.opacity = ev.value;
        mars.orbitMaterial.opacity = ev.value;
        jupiter.orbitMaterial.opacity = ev.value;
        saturn.orbitMaterial.opacity = ev.value;
        uranus.orbitMaterial.opacity = ev.value;
        neptune.orbitMaterial.opacity = ev.value;
        harley.orbitMaterial.opacity = ev.value;
        parkerSolarProbe.orbitMaterial.opacity = ev.value;
    });
    // Thêm từng orbit color vào folder, dùng kiểu màu
    orbitColorFolder.addBinding(settings, 'mercury_orbit_color', { view: 'color' }).on('change', (ev) => {
        mercury.orbitMaterial.color = new THREE.Color(ev.value);
    });
    orbitColorFolder.addBinding(settings, 'venus_orbit_color', { view: 'color' }).on('change', (ev) => {
        venus.orbitMaterial.color = new THREE.Color(ev.value);
    });
    orbitColorFolder.addBinding(settings, 'earth_orbit_color', { view: 'color' }).on('change', (ev) => {
        earth.orbitMaterial.color = new THREE.Color(ev.value);
    });
    orbitColorFolder.addBinding(settings, 'mars_orbit_color', { view: 'color' }).on('change', (ev) => {
        mars.orbitMaterial.color = new THREE.Color(ev.value);
    });
    orbitColorFolder.addBinding(settings, 'jupiter_orbit_color', { view: 'color' }).on('change', (ev) => {
        jupiter.orbitMaterial.color = new THREE.Color(ev.value);
    });
    orbitColorFolder.addBinding(settings, 'saturn_orbit_color', { view: 'color' }).on('change', (ev) => {
        saturn.orbitMaterial.color = new THREE.Color(ev.value);
    });
    orbitColorFolder.addBinding(settings, 'uranus_orbit_color', { view: 'color' }).on('change', (ev) => {
        uranus.orbitMaterial.color = new THREE.Color(ev.value);
    });
    orbitColorFolder.addBinding(settings, 'neptune_orbit_color', { view: 'color' }).on('change', (ev) => {
        neptune.orbitMaterial.color = new THREE.Color(ev.value);
    });


    const meteors_folder = pane.addFolder({
        title: 'Meteors Setting',
        expanded: true,
    });


    meteors_folder.addBinding(settings.meteors_settings, 'spawnInterval', {
        min: 0.1,
        max: 2,
        step: 0.1,
    }).on('change', (ev) => {
        meteorShower.settings.spawnInterval = ev.value;
    });

    meteors_folder.addBinding(settings.meteors_settings, 'angleMin', {
        min: 0,
        max: 180,
        step: 1,
    }).on('change', (ev) => {
        meteorShower.settings.angleMin = ev.value;
    });

    meteors_folder.addBinding(settings.meteors_settings, 'angleMax', {
        min: 180,
        max: 360,
        step: 1,
    }).on('change', (ev) => {
        meteorShower.settings.angleMax = ev.value;
    });

    meteors_folder.addBinding(settings.meteors_settings, 'speed', {
        min: 0.1,
        max: 3,
        step: 1,
    }).on('change', (ev) => {
        meteorShower.settings.speed = ev.value;
    });

    meteors_folder.addBinding(settings.meteors_settings, 'scale', {
        min: 0.5,
        max: 2,
        step: 0.1,
    }).on('change', (ev) => {
        meteorShower.settings.scale = ev.value;
    });

    meteors_folder.addBinding(settings.meteors_settings, 'tailLength', {
        min: 10,
        max: 50,
        step: 1,
    }).on('change', (ev) => {
        meteorShower.settings.tailLength = ev.value;
    });

    meteors_folder.addBinding(settings.meteors_settings, 'spawnYMin', {
        min: 0.1,
        max: 0.5,
        step: 0.1,
    }).on('change', (ev) => {
        meteorShower.settings.spawnYMin = ev.value;
    });

    meteors_folder.addBinding(settings.meteors_settings, 'spawnYHeight', {
        min: 0.6,
        max: 1.5,
        step: 0.1,
    }).on('change', (ev) => {
        meteorShower.settings.spawnYHeight = ev.value;
    });

    meteors_folder.addBinding(settings.meteors_settings, 'maxMeteors', {
        min: 100,
        max: 500,
        step: 10,
    }).on('change', (ev) => {
        meteorShower.settings.maxMeteors = ev.value;
    });

    const music_folder = pane.addFolder({
        title: 'Music Setting',
        expanded: true,
    });

    // Danh sách bài hát
    const musicTracks = {
        currentTrack: 'track1',
        tracks: {
            track1: 'assets/audio/APLMate.com - Aura of the Alien - Imphenzia.mp3',
            track2: 'assets/audio/discovery_planet_x.mp3',
            track3: 'assets/audio/painting.mp3'
        }
    };

    // Thêm dropdown để chọn bài hát
    music_folder.addBinding(musicTracks, 'currentTrack', {
        options: {
            'Bài hát 1': 'track1',
            'Bài hát 2': 'track2',
            'Bài hát 3': 'track3'
        }
    }).on('change', (ev) => {
        changeTrack(ev.value);
    });



    music_folder.addBinding(settings.music_setting, 'volume', {
        min: 0,
        max: 1,
        step: 0.1
    }).on('change', (ev) => {
        sound.setVolume(ev.value);
    });

    music_folder.addBinding(settings.music_setting, 'loop').on('change', (ev) => {
        sound.setLoop(ev.value);
    });





    // Camera
    const camera = GetCamera(0, 1, 100);

    // Tạo AudioListener và gắn vào camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Tạo nguồn âm thanh toàn cục
    const sound = new THREE.Audio(listener);

    // Tải file âm thanh và thiết lập
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/audio/painting.mp3', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight);
    document.body.appendChild(renderer.domElement);


    // Set z-index
    renderer.domElement.style.position = 'absolute'; // cần thiết để z-index có tác dụng
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.pointerEvents = 'all';
    renderer.toneMapping = THREE.ACESFilmicToneMapping;



    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.75;
    controls.screenSpacePanning = false;


    // ******  POSTPROCESSING setup ******
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // ******  OUTLINE PASS  ******
    const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePass.edgeStrength = 3;
    outlinePass.edgeGlow = 1;
    outlinePass.visibleEdgeColor.set(0xffffff);
    outlinePass.hiddenEdgeColor.set(0x190a05);
    composer.addPass(outlinePass);

    // ******  BLOOM PASS  ******
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
    bloomPass.threshold = 0.75;
    bloomPass.radius = 1.5;
    composer.addPass(bloomPass);

    // ****** AMBIENT LIGHT ******
    console.log("Add the ambient light");
    var lightAmbient = new THREE.AmbientLight(0x222222, 6);
    scene.add(lightAmbient);

    // ******  CONTROLS  ******
    // const gui = new dat.GUI({ autoPlace: false });
    // const customContainer = document.getElementById('gui-container');
    // customContainer.appendChild(gui.domElement);

    // mouse movement
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event) {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // ******  SELECT PLANET  ******
    let selectedPlanet = null;
    let isMovingTowardsPlanet = false;
    let targetCameraPosition = new THREE.Vector3();
    let offset;

    function onDocumentMouseDown(event) {
        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(raycastTargets);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            selectedPlanet = identifyPlanet(clickedObject);
            if (selectedPlanet) {
                closeInfoNoZoomOut();

                settings.accelerationOrbit = 0; // Stop orbital movement

                // Update camera to look at the selected planet
                const planetPosition = new THREE.Vector3();
                selectedPlanet.planet.getWorldPosition(planetPosition);
                controls.target.copy(planetPosition);
                camera.lookAt(planetPosition); // Orient the camera towards the planet

                targetCameraPosition.copy(planetPosition).add(camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset));
                isMovingTowardsPlanet = true;
            }
        }
    }


    // ******  SHOW PLANET INFO AFTER SELECTION  ******
    function showPlanetInfo(planet) {
        var info = document.getElementById('planetInfo');
        var name = document.getElementById('planetName');
        var details = document.getElementById('planetDetails');

        name.innerText = planet;

        // Tạo HTML với layout mới
        details.innerHTML = `
            <div class="info-row">
                <span class="info-label"><b>Radius</b></span>
                <span class="info-value">${planetData[planet].radius}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><b>Tilt</b></span>
                <span class="info-value">${planetData[planet].tilt}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><b>Rotation</b></span>
                <span class="info-value">${planetData[planet].rotation}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><b>Orbit</b></span>
                <span class="info-value">${planetData[planet].orbit}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><b>Distance</b></span>
                <span class="info-value">${planetData[planet].distance}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><b>Moons</b></span>
                <span class="info-value">${planetData[planet].moons}</span>
            </div>
            <div class="planet-description">
                <p>${planetData[planet].info}</p>
            </div>
        `;
        //details.innerText = `Radius: ${planetData[planet].radius}\nTilt: ${planetData[planet].tilt}\nRotation: ${planetData[planet].rotation}\nOrbit: ${planetData[planet].orbit}\nDistance: ${planetData[planet].distance}\nMoons: ${planetData[planet].moons}\nInfo: ${planetData[planet].info}`;
        info.style.display = 'block';
    }
    let isZoomingOut = false;
    let zoomOutTargetPosition = new THREE.Vector3(-75, 20, 5);
    // close 'x' button function
    function closeInfo() {
        var info = document.getElementById('planetInfo');
        info.style.display = 'none';
        settings.accelerationOrbit = 1;
        isZoomingOut = true;
        selectedPlanet = null; // Clear selected planet
        controls.target.set(0, 0, 0);
    }
    window.closeInfo = closeInfo;
    // close info when clicking another planet
    function closeInfoNoZoomOut() {
        var info = document.getElementById('planetInfo');
        info.style.display = 'none';
        settings.accelerationOrbit = 1;
    }

    const identifyPlanet = (clickedObject) => {
        // Logic to identify which planet was clicked based on the clicked object, different offset for camera distance
        if (clickedObject === mercury.planet || clickedObject === mercury.Atmosphere) {
            offset = 7;
            return mercury;
        } else if (clickedObject === venus.planet || clickedObject === venus.Atmosphere) {
            offset = 15;
            return venus;
        } else if (clickedObject === earth.planet || clickedObject === earth.Atmosphere) {
            offset = 17;
            return earth;
        } else if (clickedObject === mars.planet || clickedObject === mars.Atmosphere) {
            offset = 7;
            return mars;
        } else if (clickedObject === jupiter.planet || clickedObject === jupiter.Atmosphere) {
            offset = 50;
            return jupiter;
        } else if (clickedObject === saturn.planet || clickedObject === saturn.Atmosphere) {
            offset = 50;
            return saturn;
        } else if (clickedObject === uranus.planet || clickedObject === uranus.Atmosphere) {
            offset = 15;
            return uranus;
        } else if (clickedObject === neptune.planet || clickedObject === neptune.Atmosphere) {
            offset = 15;
            return neptune;
        }
        return null;
    }



    // SUN
    // const sun_config = GetSunConfig(settings.accelerationOrbit);
    // sun_config.forEach(item => {
    //     LoadObject(item.modelPath, item.position, item.scale, function(loadedModel) {
    //         item.mesh = loadedModel;
    //         item.mesh.traverse(function (child) {
    //             if (child.isMesh) {
    //                 child.castShadow = true;
    //                 child.receiveShadow = true;

    //                 // Thêm hiệu ứng phát sáng (emissive)
    //                 if (child.material && 'emissive' in child.material) {
    //                     child.material.emissive = new THREE.Color(0xFFF88F); // màu vàng nhạt như mặt trời
    //                     child.material.emissiveIntensity = 1.5; // điều chỉnh độ sáng tùy bạn
    //                 }
    //             }
    //         });
    //     }, scene);
    // });

    // console.log(sun_config[0].mesh);

    const { sun, sunMat } = GetSun(697 / 200, settings.sunIntensity);
    scene.add(sun);





    //point light in the sun
    const pointLight = new THREE.PointLight(0xFDFFD3, 1200, 400, 1.4);
    scene.add(pointLight);

    const ratio = 150;

    // PLANET SETTINGS
    const mercury_settings = planetSettings[0];
    const venus_settings = planetSettings[1];
    const earth_settings = planetSettings[2];
    const mars_settings = planetSettings[3];
    const jupiter_settings = planetSettings[4];
    const saturn_settings = planetSettings[5];
    const uranus_settings = planetSettings[6];
    const neptune_settings = planetSettings[7];

    // PLANETS
    const mercury = CreatePlanet('Mercury', 2.4, mercury_settings.distance_multiplier, 0, "assets/sprites/mercury.jpg", "assets/sprites/mercurybump.jpg", null, null, null, scene, mercury_settings.minor_axis, mercury_settings.major_axis, mercury_settings.min_distance, mercury_settings.max_distance, settings.mercury_orbit_color, settings.orbit_opacity, mercury_settings.inclination);
    const venus = CreatePlanet('Venus', 6.1, venus_settings.distance_multiplier, 3, "assets/sprites/venusmap.jpg", "assets/sprites/venusbump.jpg", null, "assets/sprites/venus_atmosphere.jpg", null, scene, venus_settings.minor_axis, venus_settings.major_axis, venus_settings.min_distance, venus_settings.max_distance, settings.venus_orbit_color, settings.orbit_opacity, venus_settings.inclination);


    const earth_material = GetEarthMaterial(new THREE.Vector3(0, 0, 0));
    const earth_moon = GetEarthMoon(settings.accelerationOrbit);

    const earth = CreatePlanet('Earth', 6.4, earth_settings.distance_multiplier, 23, earth_material, null, null, "assets/sprites/earth_atmosphere.jpg", earth_moon, scene, earth_settings.minor_axis, earth_settings.major_axis, earth_settings.min_distance, earth_settings.max_distance, settings.earth_orbit_color, settings.orbit_opacity, earth_settings.inclination);
    const earth_satellites = GetEarthSatellite(settings.accelerationOrbit);
    earth_satellites.forEach(satellite => {
        LoadObject(satellite.modelPath, satellite.position, satellite.scale, function(loadedModel) {
            satellite.mesh = loadedModel;
            earth.planetSystem.add(satellite.mesh);
            satellite.mesh.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        }, scene);
    });


    const mars = CreatePlanet('Mars', 3.4, mars_settings.distance_multiplier, 25, "assets/sprites/marsmap.jpg", "assets/sprites/marsbump.jpg", null, null, null, scene, mars_settings.minor_axis, mars_settings.major_axis, mars_settings.min_distance, mars_settings.max_distance, settings.mars_orbit_color, settings.orbit_opacity, mars_settings.inclination);


    const marsMoons = GetMarsMoon(settings.accelerationOrbit);
    marsMoons.forEach(moon => {
        LoadObject(moon.modelPath, moon.position, moon.scale, function(loadedModel) {
            moon.mesh = loadedModel;
            mars.planetSystem.add(moon.mesh);
            moon.mesh.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        }, scene);
    });


    const jupiterMoons = GetJupiterMoons(settings.accelerationOrbit);
    const jupiter = CreatePlanet('Jupiter', 69 / 4, jupiter_settings.distance_multiplier, 3, "assets/sprites/jupiter.jpg", null, null, null, jupiterMoons, scene, jupiter_settings.minor_axis, jupiter_settings.major_axis, jupiter_settings.min_distance, jupiter_settings.max_distance, settings.jupiter_orbit_color, settings.orbit_opacity, jupiter_settings.inclination);


    const saturn = CreatePlanet('Saturn', 58 / 4, saturn_settings.distance_multiplier, 26, "assets/sprites/saturnmap.jpg", null, {
        innerRadius: 18,
        outerRadius: 29,
        texture: "assets/sprites/saturn_ring.png"
    }, null, null, scene, saturn_settings.minor_axis, saturn_settings.major_axis, saturn_settings.min_distance, saturn_settings.max_distance, settings.saturn_orbit_color, settings.orbit_opacity, saturn_settings.inclination);


    const uranus = CreatePlanet('Uranus', 25 / 4, uranus_settings.distance_multiplier, 82, "assets/sprites/uranus.jpg", null, {
        innerRadius: 6,
        outerRadius: 8,
        texture: "assets/sprites/uranus_ring.png"
    }, null, null, scene, uranus_settings.minor_axis, uranus_settings.major_axis, uranus_settings.min_distance, uranus_settings.max_distance, settings.uranus_orbit_color, settings.orbit_opacity, uranus_settings.inclination);

    const neptune = CreatePlanet('Neptune', 24 / 4, neptune_settings.distance_multiplier, 28, "assets/sprites/neptune.jpg", null, null, null, null, scene, neptune_settings.minor_axis, neptune_settings.major_axis, neptune_settings.min_distance, neptune_settings.max_distance, settings.neptune_orbit_color, settings.orbit_opacity, neptune_settings.inclination);

    // ------------- COMET --------------------------
    const harley = await CreateAstronomicalObject('Harley', 0.1, cometSettings[0].distance_multiplier, "assets/scripts/models/moons/phobos.glb", 0, null, null, null, null, null, scene, cometSettings[0].minor_axis, cometSettings[0].major_axis, cometSettings[0].min_distance, cometSettings[0].max_distance, settings.harley_orbit_color, settings.orbit_opacity, cometSettings[0].inclination);

    // ------------- SATELLITE --------------------------
    const parkerSolarProbe = await CreateAstronomicalObject('Parker Solar Probe', 0.1, satelliteSettings[0].distance_multiplier, "assets/models/PSP.glb", 0, null, null, null, null, null, scene, satelliteSettings[0].minor_axis, satelliteSettings[0].major_axis, satelliteSettings[0].min_distance, satelliteSettings[0].max_distance, settings.parker_orbit_color, settings.orbit_opacity, satelliteSettings[0].inclination);
    const lucy = await CreateAstronomicalObject('Lucy', 1, satelliteSettings[1].distance_multiplier, "assets/models/lucy__nasa_space_probe__free_download.glb", 0, null, null, null, null, null, scene, satelliteSettings[1].minor_axis, satelliteSettings[1].major_axis, satelliteSettings[1].min_distance, satelliteSettings[1].max_distance, settings.lucy_orbit_color, settings.orbit_opacity, satelliteSettings[1].inclination);

    //const pluto = CreatePlanet('Pluto', 1, 350, 57, "assets/sprites/plutomap.jpg", null, null, null, null, scene, pluto_settings.minor_axis, pluto_settings.major_axis, pluto_settings.min_distance, pluto_settings.max_distance  );

    // ******  PLANETS DATA  ******
    const planetData = GetPlanetData();

    let asteroids = [];
    LoadAsteroids('assets/scripts/models/asteroidPack.glb', 1000, 150, 180, asteroids, scene);
    LoadAsteroids('assets/scripts/models/asteroidPack.glb', 3000, 375, 395, asteroids, scene);

    // Array of planets and atmospheres for raycasting
    const raycastTargets = [
        mercury.planet, venus.planet, venus.Atmosphere, earth.planet, earth.Atmosphere,
        mars.planet, jupiter.planet, saturn.planet, uranus.planet, neptune.planet
        //pluto.planet
    ];

    renderer.shadowMap.enabled = true;
    pointLight.castShadow = true;

    //properties for the point light
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;
    pointLight.shadow.camera.near = 10;
    pointLight.shadow.camera.far = 20;


    //casting and receiving shadows
    earth.planet.castShadow = true;
    earth.planet.receiveShadow = true;
    earth.Atmosphere.castShadow = true;
    earth.Atmosphere.receiveShadow = true;
    earth.moons.forEach(moon => {
        moon.mesh.castShadow = true;
        moon.mesh.receiveShadow = true;
    });
    mercury.planet.castShadow = true;
    mercury.planet.receiveShadow = true;
    venus.planet.castShadow = true;
    venus.planet.receiveShadow = true;
    venus.Atmosphere.receiveShadow = true;
    mars.planet.castShadow = true;
    mars.planet.receiveShadow = true;
    jupiter.planet.castShadow = true;
    jupiter.planet.receiveShadow = true;
    jupiter.moons.forEach(moon => {
        moon.mesh.castShadow = true;
        moon.mesh.receiveShadow = true;
    });
    saturn.planet.castShadow = true;
    saturn.planet.receiveShadow = true;
    saturn.Ring.receiveShadow = true;
    uranus.planet.receiveShadow = true;
    neptune.planet.receiveShadow = true;
    //pluto.planet.receiveShadow = true;

    // Add meteor shower
    const meteorShower = new MeteorShower(scene);

    function SunAnimation() {
        sun.rotateY(0.001 * settings.acceleration);
    }

    function MercuryAnimation(deltaTime) {
        mercury.planet.rotateY(mercury_settings.self_rotation_angle * settings.time_speed * deltaTime);
        let current_time = mercury_settings.current_time + (settings.time_speed * deltaTime);
        current_time = current_time % mercury_settings.seconds;
        mercury_settings.current_time = current_time;
        const true_anomaly = getTrueAnomalyAfterTime(current_time, mercury_settings.seconds, mercury_settings.eccentricity);
        mercury_settings.current_angle = true_anomaly;
        const { x, y } = CalculatePlanetPosition(mercury_settings.minor_axis, mercury_settings.major_axis, mercury_settings.eccentricity, mercury_settings.distance_multiplier, mercury_settings.current_angle);
        mercury.planet.position.x = x;
        mercury.planet.position.z = y;
    }

    function VenusAnimation(deltaTime) {
        venus.planet.rotateY(venus_settings.self_rotation_angle * settings.time_speed * deltaTime);
        let current_time = venus_settings.current_time + (settings.time_speed * deltaTime);
        current_time = current_time % venus_settings.seconds;
        venus_settings.current_time = current_time;
        const true_anomaly = getTrueAnomalyAfterTime(current_time, venus_settings.seconds, venus_settings.eccentricity);
        venus_settings.current_angle = true_anomaly;
        const { x, y } = CalculatePlanetPosition(venus_settings.minor_axis, venus_settings.major_axis, venus_settings.eccentricity, venus_settings.distance_multiplier, venus_settings.current_angle);
        venus.planet.position.x = x;
        venus.planet.position.z = y;
    }

    function EarthAnimation(deltaTime) {
        earth.planet.rotateY(earth_settings.self_rotation_angle * settings.time_speed * deltaTime);
        let current_time = earth_settings.current_time + (settings.time_speed * deltaTime);
        current_time = current_time % earth_settings.seconds;
        earth_settings.current_time = current_time;
        const true_anomaly = getTrueAnomalyAfterTime(current_time, earth_settings.seconds, earth_settings.eccentricity);
        earth_settings.current_angle = true_anomaly;
        const { x, y } = CalculatePlanetPosition(earth_settings.minor_axis, earth_settings.major_axis, earth_settings.eccentricity, earth_settings.distance_multiplier, earth_settings.current_angle);
        earth.planet.position.x = x;
        earth.planet.position.z = y;
    }

    function MarsAnimation(deltaTime) {
        mars.planet.rotateY(mars_settings.self_rotation_angle * settings.time_speed * deltaTime);
        let current_time = mars_settings.current_time + (settings.time_speed * deltaTime);
        current_time = current_time % mars_settings.seconds;
        mars_settings.current_time = current_time;
        const true_anomaly = getTrueAnomalyAfterTime(current_time, mars_settings.seconds, mars_settings.eccentricity);
        mars_settings.current_angle = true_anomaly;
        const { x, y } = CalculatePlanetPosition(mars_settings.minor_axis, mars_settings.major_axis, mars_settings.eccentricity, mars_settings.distance_multiplier, mars_settings.current_angle);
        mars.planet.position.x = x;
        mars.planet.position.z = y;
    }

    function JupiterAnimation(deltaTime) {
        jupiter.planet.rotateY(jupiter_settings.self_rotation_angle * settings.time_speed * deltaTime);
        let current_time = jupiter_settings.current_time + (settings.time_speed * deltaTime);
        current_time = current_time % jupiter_settings.seconds;
        jupiter_settings.current_time = current_time;
        const true_anomaly = getTrueAnomalyAfterTime(current_time, jupiter_settings.seconds, jupiter_settings.eccentricity);
        jupiter_settings.current_angle = true_anomaly;
        const { x, y } = CalculatePlanetPosition(jupiter_settings.minor_axis, jupiter_settings.major_axis, jupiter_settings.eccentricity, jupiter_settings.distance_multiplier, jupiter_settings.current_angle);
        jupiter.planet.position.x = x;
        jupiter.planet.position.z = y;
    }

    function SaturnAnimation(deltaTime) {
        saturn.planet.rotateY(saturn_settings.self_rotation_angle * settings.time_speed * deltaTime);
        let current_time = saturn_settings.current_time + (settings.time_speed * deltaTime);
        current_time = current_time % saturn_settings.seconds;
        saturn_settings.current_time = current_time;
        const true_anomaly = getTrueAnomalyAfterTime(current_time, saturn_settings.seconds, saturn_settings.eccentricity);
        saturn_settings.current_angle = true_anomaly;
        const { x, y } = CalculatePlanetPosition(saturn_settings.minor_axis, saturn_settings.major_axis, saturn_settings.eccentricity, saturn_settings.distance_multiplier, saturn_settings.current_angle);
        saturn.planet.position.x = x;
        saturn.planet.position.z = y;
        saturn.Ring.position.x = x;
        saturn.Ring.position.z = y;
    }

    function UranusAnimation(deltaTime) {
        uranus.planet.rotateY(uranus_settings.self_rotation_angle * settings.time_speed * deltaTime);
        let current_time = uranus_settings.current_time + (settings.time_speed * deltaTime);
        current_time = current_time % uranus_settings.seconds;
        uranus_settings.current_time = current_time;
        const true_anomaly = getTrueAnomalyAfterTime(current_time, uranus_settings.seconds, uranus_settings.eccentricity);
        uranus_settings.current_angle = true_anomaly;
        const { x, y } = CalculatePlanetPosition(uranus_settings.minor_axis, uranus_settings.major_axis, uranus_settings.eccentricity, uranus_settings.distance_multiplier, uranus_settings.current_angle);
        uranus.planet.position.x = x;
        uranus.planet.position.z = y;
    }

    function NeptuneAnimation(deltaTime) {
        neptune.planet.rotateY(neptune_settings.self_rotation_angle * settings.time_speed * deltaTime);
        let current_time = neptune_settings.current_time + (settings.time_speed * deltaTime);
        current_time = current_time % neptune_settings.seconds;
        neptune_settings.current_time = current_time;
        const true_anomaly = getTrueAnomalyAfterTime(current_time, neptune_settings.seconds, neptune_settings.eccentricity);
        neptune_settings.current_angle = true_anomaly;
        const { x, y } = CalculatePlanetPosition(neptune_settings.minor_axis, neptune_settings.major_axis, neptune_settings.eccentricity, neptune_settings.distance_multiplier, neptune_settings.current_angle);
        neptune.planet.position.x = x;
        neptune.planet.position.z = y;
    }

    function HarleyAnimation(deltaTime) {
        harley.astronomical_object.rotateY(cometSettings[0].self_rotation_angle * settings.time_speed * deltaTime);
        let current_time = cometSettings[0].current_time + (settings.time_speed * deltaTime);
        current_time = current_time % cometSettings[0].seconds;
        cometSettings[0].current_time = current_time;
        const true_anomaly = getTrueAnomalyAfterTime(current_time, cometSettings[0].seconds, cometSettings[0].eccentricity);
        cometSettings[0].current_angle = true_anomaly;
        const { x, y } = CalculatePlanetPosition(cometSettings[0].minor_axis, cometSettings[0].major_axis, cometSettings[0].eccentricity, cometSettings[0].distance_multiplier, cometSettings[0].current_angle);
        harley.astronomical_object.position.x = x;
        harley.astronomical_object.position.z = y;
        //console.log(harley.astronomical_object.position);
    }

    function ParkerSolarProbeAnimation(deltaTime) {
        parkerSolarProbe.astronomical_object.rotateY(satelliteSettings[0].self_rotation_angle * settings.time_speed * deltaTime);
        let current_time = satelliteSettings[0].current_time + (settings.time_speed * deltaTime);
        current_time = current_time % satelliteSettings[0].seconds;
        satelliteSettings[0].current_time = current_time;
        const true_anomaly = getTrueAnomalyAfterTime(current_time, satelliteSettings[0].seconds, satelliteSettings[0].eccentricity);
        satelliteSettings[0].current_angle = true_anomaly;
        const { x, y } = CalculatePlanetPosition(satelliteSettings[0].minor_axis, satelliteSettings[0].major_axis, satelliteSettings[0].eccentricity, satelliteSettings[0].distance_multiplier, satelliteSettings[0].current_angle);
        parkerSolarProbe.astronomical_object.position.x = x;
        parkerSolarProbe.astronomical_object.position.z = y;
    }

    function LucyAnimation(deltaTime) {
        lucy.astronomical_object.rotateY(satelliteSettings[1].self_rotation_angle * settings.time_speed * deltaTime);
        let current_time = satelliteSettings[1].current_time + (settings.time_speed * deltaTime);
        current_time = current_time % satelliteSettings[1].seconds;
        satelliteSettings[1].current_time = current_time;
        const true_anomaly = getTrueAnomalyAfterTime(current_time, satelliteSettings[1].seconds, satelliteSettings[1].eccentricity);
        satelliteSettings[1].current_angle = true_anomaly;
        const { x, y } = CalculatePlanetPosition(satelliteSettings[1].minor_axis, satelliteSettings[1].major_axis, satelliteSettings[1].eccentricity, satelliteSettings[1].distance_multiplier, satelliteSettings[1].current_angle);
        lucy.astronomical_object.position.x = x;
        lucy.astronomical_object.position.z = y;
    }

    function updateCameraPosition() {
        if (selectedPlanet && !isZoomingOut) {
            const planetPosition = new THREE.Vector3();
            selectedPlanet.planet.getWorldPosition(planetPosition);
            controls.target.copy(planetPosition);
            targetCameraPosition.copy(planetPosition).add(camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset));
        }
    }

    let count = 0;

    function animate() {
        const deltaTime = clock.getDelta();

        // Tính FPS
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
            fpsData.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            frameCount = 0;
            lastTime = currentTime;
        }
        // Update meteor shower
        meteorShower.update(deltaTime);

        SunAnimation();
        MercuryAnimation(deltaTime);
        VenusAnimation(deltaTime);
        venus.Atmosphere.rotateY(0.0005 * settings.acceleration);
        EarthAnimation(deltaTime);
        earth.Atmosphere.rotateY(0.001 * settings.acceleration);
        MarsAnimation(deltaTime);
        JupiterAnimation(deltaTime);
        SaturnAnimation(deltaTime);
        UranusAnimation(deltaTime);
        NeptuneAnimation(deltaTime);
        HarleyAnimation(deltaTime);
        ParkerSolarProbeAnimation(deltaTime);
        LucyAnimation(deltaTime);

        // camera follow selected planet
        if (selectedPlanet && !isZoomingOut) {
            const planetPosition = new THREE.Vector3();
            selectedPlanet.planet.getWorldPosition(planetPosition);
            controls.target.copy(planetPosition);
            targetCameraPosition.copy(planetPosition).add(camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset));
            camera.position.lerp(targetCameraPosition, 0.05);
        }

        // ******  ZOOM IN/OUT  ******
        if (isMovingTowardsPlanet) {
            camera.position.lerp(targetCameraPosition, 0.07);
            if (camera.position.distanceTo(targetCameraPosition) < 0.5) {
                isMovingTowardsPlanet = false;
                showPlanetInfo(selectedPlanet.name);
            }
        } else if (isZoomingOut) {
            camera.position.lerp(zoomOutTargetPosition, 0.07);

            if (camera.position.distanceTo(zoomOutTargetPosition) < 0.5) {
                isZoomingOut = false;
            }
        }

        // Animate Earth's moon
        if (earth.moons) {
            earth.moons.forEach(moon => {
                const time = performance.now();
                const tiltAngle = 5 * Math.PI / 180;

                const moonX = earth.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
                const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.sin(tiltAngle);
                const moonZ = earth.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.cos(tiltAngle);

                moon.mesh.position.set(moonX, moonY, moonZ);
                moon.mesh.rotateY(0.01);
            });
        }

        if (earth_satellites) {
            earth_satellites.forEach(satellite => {
                if (satellite.mesh) {
                    const time = performance.now();

                    const satelliteX = earth.planet.position.x + satellite.orbitRadius * Math.cos(time * satellite.orbitSpeed);
                    const satelliteY = satellite.orbitRadius * Math.sin(time * satellite.orbitSpeed);
                    const satelliteZ = mars.planet.position.z + satellite.orbitRadius * Math.sin(time * satellite.orbitSpeed);

                    satellite.mesh.position.set(satelliteX, satelliteY, satelliteZ);
                    satellite.mesh.rotateY(0.001);
                }
            });
        }
        // Animate Mars' moons
        if (marsMoons) {
            marsMoons.forEach(moon => {
                if (moon.mesh) {
                    const time = performance.now();

                    const moonX = mars.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
                    const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
                    const moonZ = mars.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);

                    moon.mesh.position.set(moonX, moonY, moonZ);
                    moon.mesh.rotateY(0.001);
                }
            });
        }



        // Animate Jupiter's moons
        if (jupiter.moons) {
            jupiter.moons.forEach(moon => {
                const time = performance.now();
                const moonX = jupiter.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
                const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
                const moonZ = jupiter.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);

                moon.mesh.position.set(moonX, moonY, moonZ);
                moon.mesh.rotateY(0.01);
            });
        }

        // Rotate asteroids
        asteroids.forEach(asteroid => {
            asteroid.rotation.y += 0.0001;
            asteroid.position.x = asteroid.position.x * Math.cos(0.0001 * settings.accelerationOrbit) + asteroid.position.z * Math.sin(0.0001 * settings.accelerationOrbit);
            asteroid.position.z = asteroid.position.z * Math.cos(0.0001 * settings.accelerationOrbit) - asteroid.position.x * Math.sin(0.0001 * settings.accelerationOrbit);
        });

        // ****** OUTLINES ON PLANETS ******
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections
        var intersects = raycaster.intersectObjects(raycastTargets);

        // Reset all outlines
        outlinePass.selectedObjects = [];

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;

            // If the intersected object is an atmosphere, find the corresponding planet
            if (intersectedObject === earth.Atmosphere) {
                outlinePass.selectedObjects = [earth.planet];
            } else if (intersectedObject === venus.Atmosphere) {
                outlinePass.selectedObjects = [venus.planet];
            } else {
                // For other planets, outline the intersected object itself
                outlinePass.selectedObjects = [intersectedObject];
            }
        }
        stats.end();

        controls.update();
        requestAnimationFrame(animate);
        composer.render();
    }
    animate();
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onDocumentMouseDown, false);
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
}

export default SolarSystem2