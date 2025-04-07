import * as THREE from "three"

const GetSun = (radius = 5, widthSegments = 64, heightSegments = 32) => 
{
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments); 

    // Tải texture bằng TextureLoader
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./assets/sprites/8k_sun.jpg');  // Đường dẫn đến hình ảnh texture
    const material = new THREE.MeshBasicMaterial({ 
        map: texture ,
        emissive: 0x0000ff, // phát sáng
        emissiveIntensity: 1
    }); // Áp dụng texture vào vật liệu
    
    //const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } ); 
    const sphere = new THREE.Mesh( geometry, material ); 

    return sphere;
}

export default GetSun;