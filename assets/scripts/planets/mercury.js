import * as THREE from "three"

const GetMercury = (radius = 1, widthSegments = 64, heightSegments = 32) => 
{
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments); 

    // Tải texture bằng TextureLoader
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./assets/sprites/8k_sun.jpg');  // Đường dẫn đến hình ảnh texture
    const material = new THREE.MeshBasicMaterial({ map: texture }); // Áp dụng texture vào vật liệu
    
    //const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } ); 
    const sphere = new THREE.Mesh( geometry, material ); 

    return sphere;
}

export default GetMercury;