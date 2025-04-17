import { GLTFLoader } from "three/examples/jsm/Addons.js";
const LoadObject = (path, position, scale, callback, scene) =>
{
    const loader = new GLTFLoader();
  
    loader.load(path, function (gltf) 
    {
        const obj = gltf.scene;
        obj.position.set(position, 0, 0);
        obj.scale.set(scale, scale, scale);
        scene.add(obj);
        if (callback) {
          callback(obj);
        }
    }, undefined, function (error) 
    {
        console.error('An error happened', error);
    });
}
export default LoadObject;