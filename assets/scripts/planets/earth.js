import * as THREE from "three"

const GetEarth = (radius = 3, widthSegments = 64, heightSegments = 32) => 
{
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments); 

    // Tải texture bằng TextureLoader
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./assets/sprites/2k_earth_daymap.jpg');  // Đường dẫn đến hình ảnh texture
    const material = new THREE.MeshStandardMaterial({ map: texture }); // Áp dụng texture vào vật liệu
    
    //const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } ); 
    const sphere = new THREE.Mesh( geometry, material ); 

    return sphere;
}

export default GetEarth;