import * as THREE from 'three';
import GetCamera from './assets/scripts/camera/camera,js';
import GetSun from './assets/scripts/planets/sun.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import GetEarthMaterial from './assets/scripts/textures/earthTexture.js';
import GetEarthMoon from './assets/scripts/moons/getEarthMoon.js';
import CreatePlanet from './assets/scripts/planets/createPlanet.js';
import GetMarsMoon from './assets/scripts/moons/getMarsMoons.js';
import LoadObject from './assets/scripts/utils/loadObject.js';
import GetJupiterMoons from './assets/scripts/moons/getJupiterMoons.js';
import GetScene from './assets/scripts/scene/scene.js';
import GetSetting from './assets/scripts/configs/setting.js';
import LoadAsteroids from './assets/scripts/asteroids/loadAsteroids.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { OutlinePass } from 'three/examples/jsm/Addons.js';
function LoadComponent() 
{
    // Scene
    const scene = GetScene();

    // SETTING
    const settings = GetSetting();

    // Camera
    const camera = GetCamera(0, 1, 100);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("gui-container").appendChild(renderer.domElement);

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
    bloomPass.threshold = 1;
    bloomPass.radius = 0.9;
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
    const sun = GetSun(697/40, settings.sunIntensity);
    scene.add(sun);

    //point light in the sun
    const pointLight = new THREE.PointLight(0xFDFFD3 , 1200, 400, 1.4);
    scene.add(pointLight);


    // PLANETS
    const mercury = CreatePlanet('Mercury', 2.4, 40, 0, "assets/sprites/mercury.jpg", "assets/sprites/mercurybump.jpg", null, null, null, scene);
    const venus = CreatePlanet('Venus', 6.1, 65, 3, "assets/sprites/venusmap.jpg", "assets/sprites/venusbump.jpg", null, "assets/sprites/venus_atmosphere.jpg", null, scene);


    const earth_material = GetEarthMaterial(sun.position);
    const earth_moon = GetEarthMoon(settings.accelerationOrbit);
    const earth = CreatePlanet('Earth', 6.4, 90, 23, earth_material, null, null, "assets/sprites/earth_atmosphere.jpg" , earth_moon, scene);

    const mars = CreatePlanet('Mars', 3.4, 115, 25, "assets/sprites/marsmap.jpg", "assets/sprites/marsbump.jpg", null,null, null, scene)
   

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
    const jupiter = CreatePlanet('Jupiter', 69/4, 200, 3, "assets/sprites/jupiter.jpg", null, null, null, jupiterMoons, scene);


    const saturn = CreatePlanet('Saturn', 58/4, 270, 26, "assets/sprites/saturnmap.jpg", null, {
      innerRadius: 18, 
      outerRadius: 29, 
      texture: "assets/sprites/saturn_ring.png"
    }, null, null, scene);


    const uranus = CreatePlanet('Uranus', 25/4, 320, 82, "assets/sprites/uranus.jpg", null, {
      innerRadius: 6, 
      outerRadius: 8, 
      texture: "assets/sprites/uranus_ring.png"
    }, null, null, scene);

    const neptune = CreatePlanet('Neptune', 24/4, 340, 28, "assets/sprites/neptune.jpg", null, null, null, null, scene);

    const pluto = CreatePlanet('Pluto', 1, 350, 57, "assets/sprites/plutomap.jpg,", null, null, null, null, scene)
    // ******  PLANETS DATA  ******
    const planetData = {
        'Mercury': {
            radius: '2,439.7 km',
            tilt: '0.034°',
            rotation: '58.6 Earth days',
            orbit: '88 Earth days',
            distance: '57.9 million km',
            moons: '0',
            info: 'The smallest planet in our solar system and nearest to the Sun.'
        },
        'Venus': {
            radius: '6,051.8 km',
            tilt: '177.4°',
            rotation: '243 Earth days',
            orbit: '225 Earth days',
            distance: '108.2 million km',
            moons: '0',
            info: 'Second planet from the Sun, known for its extreme temperatures and thick atmosphere.'
        },
        'Earth': {
            radius: '6,371 km',
            tilt: '23.5°',
            rotation: '24 hours',
            orbit: '365 days',
            distance: '150 million km',
            moons: '1 (Moon)',
            info: 'Third planet from the Sun and the only known planet to harbor life.'
        },
        'Mars': {
            radius: '3,389.5 km',
            tilt: '25.19°',
            rotation: '1.03 Earth days',
            orbit: '687 Earth days',
            distance: '227.9 million km',
            moons: '2 (Phobos and Deimos)',
            info: 'Known as the Red Planet, famous for its reddish appearance and potential for human colonization.'
        },
        'Jupiter': {
            radius: '69,911 km',
            tilt: '3.13°',
            rotation: '9.9 hours',
            orbit: '12 Earth years',
            distance: '778.5 million km',
            moons: '95 known moons (Ganymede, Callisto, Europa, Io are the 4 largest)',
            info: 'The largest planet in our solar system, known for its Great Red Spot.'
        },
        'Saturn': {
            radius: '58,232 km',
            tilt: '26.73°',
            rotation: '10.7 hours',
            orbit: '29.5 Earth years',
            distance: '1.4 billion km',
            moons: '146 known moons',
            info: 'Distinguished by its extensive ring system, the second-largest planet in our solar system.'
        },
        'Uranus': {
            radius: '25,362 km',
            tilt: '97.77°',
            rotation: '17.2 hours',
            orbit: '84 Earth years',
            distance: '2.9 billion km',
            moons: '27 known moons',
            info: 'Known for its unique sideways rotation and pale blue color.'
        },
        'Neptune': {
            radius: '24,622 km',
            tilt: '28.32°',
            rotation: '16.1 hours',
            orbit: '165 Earth years',
            distance: '4.5 billion km',
            moons: '14 known moons',
            info: 'The most distant planet from the Sun in our solar system, known for its deep blue color.'
        },
        'Pluto': {
            radius: '1,188.3 km',
            tilt: '122.53°',
            rotation: '6.4 Earth days',
            orbit: '248 Earth years',
            distance: '5.9 billion km',
            moons: '5 (Charon, Styx, Nix, Kerberos, Hydra)',
            info: 'Originally classified as the ninth planet, Pluto is now considered a dwarf planet.'
        }
    };

    let asteroids = [];
    LoadAsteroids('assets/scripts/models/asteroidPack.glb', 1000, 130, 160, asteroids, scene);
    LoadAsteroids('assets/scripts/models/asteroidPack.glb', 3000, 352, 370, asteroids, scene);

    // Array of planets and atmospheres for raycasting
    const raycastTargets = [
        mercury.planet, venus.planet, venus.Atmosphere, earth.planet, earth.Atmosphere, 
        mars.planet, jupiter.planet, saturn.planet, uranus.planet, neptune.planet, pluto.planet
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
    pluto.planet.receiveShadow = true;




    function animate()
    {

    //rotating planets around the sun and itself
    sun.rotateY(0.001 * settings.acceleration);
    mercury.planet.rotateY(0.001 * settings.acceleration);
    mercury.planet3d.rotateY(0.004 * settings.accelerationOrbit);
    venus.planet.rotateY(0.0005 * settings.acceleration)
    venus.Atmosphere.rotateY(0.0005 * settings.acceleration);
    venus.planet3d.rotateY(0.0006 * settings.accelerationOrbit);
    earth.planet.rotateY(0.005 * settings.acceleration);
    earth.Atmosphere.rotateY(0.001 * settings.acceleration);
    earth.planet3d.rotateY(0.001 * settings.accelerationOrbit);
    mars.planet.rotateY(0.01 * settings.acceleration);
    mars.planet3d.rotateY(0.0007 * settings.accelerationOrbit);
    jupiter.planet.rotateY(0.005 * settings.acceleration);
    jupiter.planet3d.rotateY(0.0003 * settings.accelerationOrbit);
    saturn.planet.rotateY(0.01 * settings.acceleration);
    saturn.planet3d.rotateY(0.0002 * settings.accelerationOrbit);
    uranus.planet.rotateY(0.005 * settings.acceleration);
    uranus.planet3d.rotateY(0.0001 * settings.accelerationOrbit);
    neptune.planet.rotateY(0.005 * settings.acceleration);
    neptune.planet3d.rotateY(0.00008 * settings.accelerationOrbit);
    pluto.planet.rotateY(0.001 * settings.acceleration)
    pluto.planet3d.rotateY(0.00006 * settings.accelerationOrbit)

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
    // Animate Mars' moons
    if (marsMoons){
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


LoadComponent();
