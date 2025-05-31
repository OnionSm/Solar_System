import * as THREE from 'three';

class MeteorShower {
    constructor(scene) {
        this.scene = scene;
        this.meteors = [];
        this.settings = {
            spawnInterval: 0.5,     // Tần suất sinh sao băng
            angleMin: 110,          // Góc nhỏ nhất (độ)
            angleMax: 130,          // Góc lớn nhất (độ)
            speed: 0.6,             // Tốc độ sao băng
            scale: 1.0,             // Tỉ lệ kích thước
            tailLength: 20,         // Độ dài đuôi sao băng (số điểm)
            spawnYMin: 0.1,         // Vị trí Y nhỏ nhất khi sinh sao băng
            spawnYHeight: 0.8,      // Độ cao vùng sinh sao băng theo Y
            maxMeteors: 100         // Số sao băng tối đa tồn tại cùng lúc
        };
    }

    createMeteor() {
        // Tạo geometry rỗng chứa vị trí đuôi sao băng
        const geometry = new THREE.BufferGeometry();

        // Tạo material cho sao băng (điểm trắng)
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.4 * this.settings.scale,    // Đầu sao băng to hơn
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });

        const meteor = new THREE.Points(geometry, material);
        this.resetMeteor(meteor);
        this.scene.add(meteor);
        this.meteors.push(meteor);
    }

    resetMeteor(meteor) {
        const angle = THREE.MathUtils.lerp(
            this.settings.angleMin,
            this.settings.angleMax,
            Math.random()
        );
        const angleRad = THREE.MathUtils.degToRad(angle);

        // Vị trí sinh ngẫu nhiên trong vùng xác định
        const spawnX = Math.random() * 200 - 100;
        const spawnY = this.settings.spawnYMin * 100 + Math.random() * this.settings.spawnYHeight * 100;
        const spawnZ = Math.random() * 200 - 100;

        meteor.position.set(spawnX, spawnY, spawnZ);
        meteor.userData = {
            velocity: new THREE.Vector3(
                Math.cos(angleRad) * this.settings.speed,
                -Math.sin(angleRad) * this.settings.speed,
                0
            ),
            life: 1.0,
            maxLife: 1.0
        };

        // Tạo mảng vị trí đuôi sao băng với chiều dài tailLength
        const positions = new Float32Array(this.settings.tailLength * 3);
        for (let i = 0; i < this.settings.tailLength; i++) {
            positions[i * 3] = spawnX;
            positions[i * 3 + 1] = spawnY;
            positions[i * 3 + 2] = spawnZ;
        }
        meteor.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }

    update(deltaTime) {
        // Sinh sao băng mới dựa theo spawnInterval
        if (Math.random() < this.settings.spawnInterval * deltaTime) {
            if (this.meteors.length < this.settings.maxMeteors) {
                this.createMeteor();
            }
        }

        // Cập nhật từng sao băng
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const meteor = this.meteors[i];
            meteor.userData.life -= deltaTime;

            if (meteor.userData.life <= 0) {
                // Hết tuổi thọ, xóa sao băng khỏi scene và mảng
                this.scene.remove(meteor);
                this.meteors.splice(i, 1);
                continue;
            }

            // Cập nhật vị trí sao băng theo vận tốc
            meteor.position.add(meteor.userData.velocity);

            // Cập nhật vị trí đuôi sao băng, đẩy các điểm cũ về sau
            const positions = meteor.geometry.attributes.position.array;
            for (let j = positions.length - 3; j >= 3; j -= 3) {
                positions[j] = positions[j - 3];
                positions[j + 1] = positions[j - 2];
                positions[j + 2] = positions[j - 1];
            }
            // Điểm đầu tiên là vị trí hiện tại của sao băng
            positions[0] = meteor.position.x;
            positions[1] = meteor.position.y;
            positions[2] = meteor.position.z;
            meteor.geometry.attributes.position.needsUpdate = true;

            // Cập nhật opacity từng điểm đuôi theo khoảng cách từ đầu đến đuôi (giả lập nhỏ dần)
            // Vì PointsMaterial không hỗ trợ kích thước riêng từng điểm, ta giảm opacity theo vị trí
            const baseOpacity = meteor.userData.life;
            const tailLength = this.settings.tailLength;
            // Tạo mảng opacity cho đuôi, giảm dần từ đầu đến đuôi
            const opacities = new Float32Array(tailLength);
            for (let k = 0; k < tailLength; k++) {
                opacities[k] = baseOpacity * (1 - k / tailLength);
            }
            // Nếu muốn dùng opacities riêng, cần tạo shader material custom
            // Tạm thời ta chỉ thay đổi opacity tổng thể (độ trong suốt) của toàn bộ điểm
            meteor.material.opacity = baseOpacity;
        }
    }
}

export default MeteorShower;
