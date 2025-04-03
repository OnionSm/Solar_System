import * as THREE from 'three';
import GetCamera from './assets/scripts/camera/camera,js';
import GetSun from './assets/scripts/planets/sun';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Đảm bảo sử dụng đúng đường dẫn

function init() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Chỉnh màu nền

    // Tạo camera với các tham số dễ thay đổi
    const camera = GetCamera(0, 1, 10); // Bạn có thể thay đổi tham số này để tùy chỉnh camera

    // Tạo renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Tạo đối tượng mặt trời
    var sun = GetSun();
    scene.add(sun);

    // Thêm ánh sáng
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.z = 2;
    scene.add(light);

    // Tạo lưới GridHelper
    const gridHelper = new THREE.GridHelper(10000, 10000); // 10x10 ô vuông
    gridHelper.rotation.x = Math.PI / 2; // Xoay từ mặt XZ sang mặt XY
    scene.add(gridHelper);

    // Thêm OrbitControls để dễ dàng di chuyển camera
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Thêm độ mượt cho việc di chuyển
    controls.dampingFactor = 0.25; // Độ mượt của chuyển động
    controls.screenSpacePanning = false; // Không cho phép pan trong không gian màn hình

    // Cập nhật ánh sáng và camera khi có sự thay đổi
    controls.addEventListener('change', () => {
        camera.updateMatrixWorld();
    });


    // Render và update
    renderer.setAnimationLoop(() => animate([sun], renderer, scene, camera, controls));
}

function animate(objects, renderer, scene, camera, controls) {
    // Xoay các đối tượng trong scene
    objects.forEach(object => {
        object.rotation.x += 0.01;
        object.rotation.y += 0.01;
    });

    // Cập nhật controls (để di chuyển camera)
    controls.update();

    // Render lại scene
    renderer.render(scene, camera);
}

init();
