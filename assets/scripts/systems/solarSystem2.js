import * as THREE from 'three';
import * as dat from 'dat.gui';
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
const SolarSystem2 = () =>
{
    const time = { value: 0 };
    // Scene
    const scene = GetScene();
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: memory
    //document.body.appendChild(stats.dom);
    
    
    const axesHelper = new THREE.AxesHelper(50); // chiều dài trục là 5 đơn vị
    scene.add(axesHelper);

    const clock = new THREE.Clock();

    // SETTING
    const settings = GetSetting();
    const planetSettings = GetPlanetSetting();
    // Camera
    const camera = GetCamera(0, 1, 100);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
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
    const gui = new dat.GUI({ autoPlace: false });
    const customContainer = document.getElementById('gui-container');
    customContainer.appendChild(gui.domElement);

    // mouse movement
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event) 
    {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    // ******  SELECT PLANET  ******
    let selectedPlanet = null;
    let isMovingTowardsPlanet = false;
    let targetCameraPosition = new THREE.Vector3();
    let offset;

    function onDocumentMouseDown(event) 
    {
        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(raycastTargets);

        if (intersects.length > 0) 
        {
            const clickedObject = intersects[0].object;
            selectedPlanet = identifyPlanet(clickedObject);
            if (selectedPlanet) 
            {
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
        details.innerText = `Radius: ${planetData[planet].radius}\nTilt: ${planetData[planet].tilt}\nRotation: ${planetData[planet].rotation}\nOrbit: ${planetData[planet].orbit}\nDistance: ${planetData[planet].distance}\nMoons: ${planetData[planet].moons}\nInfo: ${planetData[planet].info}`;
    
        info.style.display = 'block';
    }
    let isZoomingOut = false;
    let zoomOutTargetPosition = new THREE.Vector3(-175, 115, 5);
    // close 'x' button function
    function closeInfo() {
        var info = document.getElementById('planetInfo');
        info.style.display = 'none';
        settings.accelerationOrbit = 1;
        isZoomingOut = true;
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
              if (clickedObject.material === mercury.planet.material) {
                offset = 10;
                return mercury;
              } else if (clickedObject.material === venus.Atmosphere.material) {
                offset = 25;
                return venus;
              } else if (clickedObject.material === earth.Atmosphere.material) {
                offset = 25;
                return earth;
              } else if (clickedObject.material === mars.planet.material) {
                offset = 15;
                return mars;
              } else if (clickedObject.material === jupiter.planet.material) {
                offset = 50;
                return jupiter;
              } else if (clickedObject.material === saturn.planet.material) {
                offset = 50;
                return saturn;
              } else if (clickedObject.material === uranus.planet.material) {
                offset = 25;
                return uranus;
              } else if (clickedObject.material === neptune.planet.material) {
                offset = 20;
                return neptune;
              } else if (clickedObject.material === pluto.planet.material) {
                offset = 10;
                return pluto;
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
    
    const sun= GetSun(697/80, settings.sunIntensity);
    scene.add(sun);



   

    //point light in the sun
    const pointLight = new THREE.PointLight(0xFDFFD3 , 1200, 400, 1.4);
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
    const mercury = CreatePlanet('Mercury', 2.4, mercury_settings.distance_multiplier, 0, "assets/sprites/mercury.jpg", "assets/sprites/mercurybump.jpg", null, null, null, scene, mercury_settings.minor_axis, mercury_settings.major_axis, mercury_settings.min_distance, mercury_settings.max_distance);
    const venus = CreatePlanet('Venus', 6.1, venus_settings.distance_multiplier, 3, "assets/sprites/venusmap.jpg", "assets/sprites/venusbump.jpg", null, "assets/sprites/venus_atmosphere.jpg", null, scene, venus_settings.minor_axis, venus_settings.major_axis, venus_settings.min_distance, venus_settings.max_distance);


    const earth_material = GetEarthMaterial(new THREE.Vector3(0,0,0));
    const earth_moon = GetEarthMoon(settings.accelerationOrbit);
 
    const earth = CreatePlanet('Earth', 6.4, earth_settings.distance_multiplier, 23, earth_material, null, null, "assets/sprites/earth_atmosphere.jpg" , earth_moon, scene, earth_settings.minor_axis, earth_settings.major_axis, earth_settings.min_distance, earth_settings.max_distance);
    const earth_satellites = GetEarthSatellite(settings.accelerationOrbit);
    earth_satellites.forEach(satellite => 
    {
        LoadObject(satellite.modelPath, satellite.position, satellite.scale, function(loadedModel) 
        {
            satellite.mesh = loadedModel;
            earth.planetSystem.add(satellite.mesh); 
            satellite.mesh.traverse(function (child) 
            {
                if (child.isMesh)
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        },scene);
    });
    
    
    const mars = CreatePlanet('Mars', 3.4, mars_settings.distance_multiplier, 25, "assets/sprites/marsmap.jpg", "assets/sprites/marsbump.jpg", null,null, null, scene, mars_settings.minor_axis, mars_settings.major_axis, mars_settings.min_distance, mars_settings.max_distance);
   

    const marsMoons = GetMarsMoon(settings.accelerationOrbit);
    marsMoons.forEach(moon => 
    {
        LoadObject(moon.modelPath, moon.position, moon.scale, function(loadedModel) 
        {
            moon.mesh = loadedModel;
            mars.planetSystem.add(moon.mesh);
            moon.mesh.traverse(function (child) 
            {
                if (child.isMesh)
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        },scene);
    });


    const jupiterMoons = GetJupiterMoons(settings.accelerationOrbit);
    const jupiter = CreatePlanet('Jupiter', 69/4, jupiter_settings.distance_multiplier, 3, "assets/sprites/jupiter.jpg", null, null, null, jupiterMoons, scene, jupiter_settings.minor_axis, jupiter_settings.major_axis, jupiter_settings.min_distance, jupiter_settings.max_distance);


    const saturn = CreatePlanet('Saturn', 58/4, saturn_settings.distance_multiplier, 26, "assets/sprites/saturnmap.jpg", null, {
      innerRadius: 18, 
      outerRadius: 29, 
      texture: "assets/sprites/saturn_ring.png"
    }, null, null, scene, saturn_settings.minor_axis, saturn_settings.major_axis, saturn_settings.min_distance, saturn_settings.max_distance);


    const uranus = CreatePlanet('Uranus', 25/4, uranus_settings.distance_multiplier, 82, "assets/sprites/uranus.jpg", null, {
      innerRadius: 6, 
      outerRadius: 8, 
      texture: "assets/sprites/uranus_ring.png"
    }, null, null, scene, uranus_settings.minor_axis, uranus_settings.major_axis, uranus_settings.min_distance, uranus_settings.max_distance);

    const neptune = CreatePlanet('Neptune', 24/4, neptune_settings.distance_multiplier, 28, "assets/sprites/neptune.jpg", null, null, null, null, scene, neptune_settings.minor_axis, neptune_settings.major_axis, neptune_settings.min_distance, neptune_settings.max_distance);

    //const pluto = CreatePlanet('Pluto', 1, 350, 57, "assets/sprites/plutomap.jpg", null, null, null, null, scene, pluto_settings.minor_axis, pluto_settings.major_axis, pluto_settings.min_distance, pluto_settings.max_distance  );
    
    // ******  PLANETS DATA  ******
    const planetData = GetPlanetData();

    let asteroids = [];
    LoadAsteroids('assets/scripts/models/asteroidPack.glb', 1000, 130, 160, asteroids, scene);
    LoadAsteroids('assets/scripts/models/asteroidPack.glb', 3000, 352, 370, asteroids, scene);

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

    function SunAnimation()
    {
        sun.rotateY(0.001 * settings.acceleration);
    }
    function MercuryAnimation()
    {
        const deltaTime = clock.getDelta();
        console.log("Delta time", deltaTime);
        mercury.planet.rotateY(0.001 * settings.acceleration);
        console.log("Angle offset", mercury_settings.angle_offset);
        const current_angle = mercury_settings.current_angle + (mercury_settings.angle_offset * settings.time_speed * deltaTime);
        mercury_settings.current_angle = current_angle;
        console.log("Mercury current angle", current_angle);
        const {x,y} = CalculatePlanetPosition(mercury_settings.minor_axis, mercury_settings.major_axis, mercury_settings.eccentricity, mercury_settings.distance_multiplier, mercury_settings.current_angle);
        mercury.planet.position.x = x - mercury.orbit_center.x;
        mercury.planet.position.z = y + mercury.orbit_center.y;
        
    }
    function VenusAnimation()
    {
        venus.planet.rotateY(0.0005 * settings.acceleration);
    }
    function EarthAnimation()
    {
        earth.planet.rotateY(0.005 * settings.acceleration);
    }
    function MarsAnimation()
    {
        mars.planet.rotateY(0.01 * settings.acceleration);
    }
    function JupiterAnimation()
    {
        jupiter.planet.rotateY(0.005 * settings.acceleration);
    }
    function SaturnAnimation()
    {
        saturn.planet.rotateY(0.01 * settings.acceleration);
    }
    function UranusAnimation()
    {
        uranus.planet.rotateY(0.005 * settings.acceleration);
    }
    function NeptuneAnimation()
    {
        neptune.planet.rotateY(0.005 * settings.acceleration);
    }

    function animate()
    {
    
    //stats.begin();
    
    //rotating planets around the sun and itself
    // if(sun_config[0].mesh != null)
    // {
    //     sun_config[0].mesh.rotateY(0.001 * settings.acceleration);
    // }
    SunAnimation();
    MercuryAnimation();
    //mercury.planet3d.rotateY(0.004 * settings.accelerationOrbit);
    VenusAnimation();
    venus.Atmosphere.rotateY(0.0005 * settings.acceleration);
    //venus.planet3d.rotateY(0.0006 * settings.accelerationOrbit);
    EarthAnimation();
    earth.Atmosphere.rotateY(0.001 * settings.acceleration);
    //earth.planet3d.rotateY(0.001 * settings.accelerationOrbit);
    MarsAnimation();
    //mars.planet3d.rotateY(0.0007 * settings.accelerationOrbit);
    JupiterAnimation();
    //jupiter.planet3d.rotateY(0.0003 * settings.accelerationOrbit);
    SaturnAnimation();
    //saturn.planet3d.rotateY(0.0002 * settings.accelerationOrbit);
    UranusAnimation();
    //uranus.planet3d.rotateY(0.0001 * settings.accelerationOrbit);
    NeptuneAnimation();
    //neptune.planet3d.rotateY(0.00008 * settings.accelerationOrbit);
    // pluto.planet.rotateY(0.001 * settings.acceleration)
    // pluto.planet3d.rotateY(0.00006 * settings.accelerationOrbit)
    

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

    if (earth_satellites){
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
    if (marsMoons)
    {
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
    // ******  ZOOM IN/OUT  ******
    if (isMovingTowardsPlanet) {
    // Smoothly move the camera towards the target position
    camera.position.lerp(targetCameraPosition, 0.03);

    // Check if the camera is close to the target position
    if (camera.position.distanceTo(targetCameraPosition) < 1) {
        isMovingTowardsPlanet = false;
        showPlanetInfo(selectedPlanet.name);

    }
    } else if (isZoomingOut) {
    camera.position.lerp(zoomOutTargetPosition, 0.05);

    if (camera.position.distanceTo(zoomOutTargetPosition) < 1) {
        isZoomingOut = false;
    }
    }
    stats.end();
    //stats.end();

    controls.update();
    requestAnimationFrame(animate);
    composer.render();
    }
    animate();
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onDocumentMouseDown, false);
    window.addEventListener('resize', function(){
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
      composer.setSize(window.innerWidth,window.innerHeight);
    });
    
}

export default SolarSystem2;