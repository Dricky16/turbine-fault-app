import * as THREE from 'three';

// 1. Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(10, 20, 15);
dirLight.castShadow = true;
dirLight.shadow.camera.left = -60;
dirLight.shadow.camera.right = 60;
dirLight.shadow.camera.top = 60;
dirLight.shadow.camera.bottom = -60;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// Lava background
const planeGeo = new THREE.PlaneGeometry(300, 300);
const planeMat = new THREE.MeshStandardMaterial({ 
    color: 0xff1100, 
    emissive: 0xff2200, 
    emissiveIntensity: 1.0,
    roughness: 0.4
});
const backPlane = new THREE.Mesh(planeGeo, planeMat);
backPlane.position.z = -3; 
backPlane.receiveShadow = true;
scene.add(backPlane);

// Screen Bounds
const vFov = camera.fov * Math.PI / 180;
const heightAtZ = 2 * Math.tan(vFov / 2) * camera.position.z;
const widthAtZ = heightAtZ * camera.aspect;

const bounds = {
    width: widthAtZ * 1.4,
    height: heightAtZ * 1.4
};
const startX = -bounds.width / 2;
const startY = bounds.height / 2;

// 2. Load the Photorealistic Texture
const textureLoader = new THREE.TextureLoader();
const singleScaleMap = textureLoader.load('snakeskin.jpg');
singleScaleMap.colorSpace = THREE.SRGBColorSpace;
singleScaleMap.wrapS = THREE.RepeatWrapping;
singleScaleMap.wrapT = THREE.RepeatWrapping;

// Zoom into a specific, perfect scale from the top right of the photograph
singleScaleMap.repeat.set(0.12, 0.12);
singleScaleMap.offset.set(0.85, 0.85);

const material = new THREE.MeshStandardMaterial({ 
    map: singleScaleMap,
    bumpMap: singleScaleMap,
    bumpScale: 0.15,
    roughness: 0.35,
    metalness: 0.15
});

// 3. Build the Perfect Uniform 3D Grid
const cols = 22; 
const colSpacing = bounds.width / (cols - 1);
const rows = 35;
const rowSpacing = bounds.height / (rows - 1);

const scaleWidth = colSpacing * 1.35; // Perfect horizontal overlap
const scaleHeight = rowSpacing * 1.60; // Perfect vertical shingling

const shape = new THREE.Shape();
// Hinge at top (0, 0)
shape.moveTo(0, 0);
// Right side curve
shape.quadraticCurveTo(scaleWidth * 0.5, -scaleHeight * 0.3, scaleWidth * 0.5, -scaleHeight * 0.5);
// Right side taper to point
shape.quadraticCurveTo(scaleWidth * 0.2, -scaleHeight * 0.9, 0, -scaleHeight);
// Left side taper from point
shape.quadraticCurveTo(-scaleWidth * 0.2, -scaleHeight * 0.9, -scaleWidth * 0.5, -scaleHeight * 0.5);
// Left side curve
shape.quadraticCurveTo(-scaleWidth * 0.5, -scaleHeight * 0.3, 0, 0);

// Add real physical 3D thickness to the geometry
const extrudeSettings = {
    steps: 1,
    depth: 0.08, 
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.02,
    bevelSegments: 2
};
const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
geometry.computeVertexNormals();

const count = cols * rows;
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
instancedMesh.castShadow = true;
instancedMesh.receiveShadow = true; 
scene.add(instancedMesh);

const scalesData = [];
const dummy = new THREE.Object3D();
const color = new THREE.Color();
let instanceIdx = 0;

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        let x = startX + (col * colSpacing);
        if (row % 2 !== 0) {
            x += colSpacing / 2; // Interlocking brick pattern
        }
        
        const y = startY - (row * rowSpacing);
        
        // Z-sorting: lower rows are drawn ON TOP of upper rows
        const z = row * 0.05 + (col % 2) * 0.01;

        dummy.position.set(x, y, z);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(instanceIdx, dummy.matrix);

        // Tint the texture based on position to simulate a real pelt laid out
        // Bright yellow-green spine, fading to dark green edges
        const distFromCenter = Math.abs(x) / (bounds.width / 2);
        color.lerpColors(new THREE.Color(0xddee33), new THREE.Color(0x052205), distFromCenter);
        
        // Subtle organic noise so it doesn't look computer-generated
        const noise = (Math.random() - 0.5) * 0.08;
        color.r = Math.min(1.0, Math.max(0, color.r + noise));
        color.g = Math.min(1.0, Math.max(0, color.g + noise));
        color.b = Math.min(1.0, Math.max(0, color.b + noise));
        
        instancedMesh.setColorAt(instanceIdx, color);

        scalesData.push({
            x: x,
            y: y,
            z: z,
            angleX: 0,
            velocity: 0,
            energy: 0
        });

        instanceIdx++;
    }
}
instancedMesh.instanceMatrix.needsUpdate = true;
if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

// 4. Mouse Tracking & Physics
const mouse = new THREE.Vector2(-9999, -9999);
const raycaster = new THREE.Raycaster();
const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const currentIntersection = new THREE.Vector3();
const lastIntersection = new THREE.Vector3();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Physics
const SPRING_STIFFNESS = 0.20;
const SPRING_DAMPING = 0.82;
const ENERGY_DECAY = 0.88; 

// Tight influence radius
const INFLUENCE_RADIUS = Math.min(colSpacing, rowSpacing) * 0.9; 
const MAX_ANGLE = Math.PI / 1.5;

let firstFrame = true;

function animate() {
    requestAnimationFrame(animate);

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(intersectPlane, currentIntersection);

    if (firstFrame) {
        lastIntersection.copy(currentIntersection);
        firstFrame = false;
    }

    const mouseSpeed = currentIntersection.distanceTo(lastIntersection);
    
    if (mouseSpeed > 0.01) {
        for (let i = 0; i < count; i++) {
            const data = scalesData[i];
            
            // Apply physics slightly below the hinge
            const interactionY = data.y - (scaleHeight * 0.4); 
            
            const dx = data.x - currentIntersection.x;
            const dy = interactionY - currentIntersection.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < INFLUENCE_RADIUS * INFLUENCE_RADIUS) {
                const dist = Math.sqrt(distSq);
                const factor = 1 - (dist / INFLUENCE_RADIUS);
                data.energy = Math.min(1.0, data.energy + mouseSpeed * factor * 2.5);
            }
        }
    }

    lastIntersection.copy(currentIntersection);

    for (let i = 0; i < count; i++) {
        const data = scalesData[i];

        data.energy *= ENERGY_DECAY;
        
        // Negative angle rotates the bottom of the scale OUTWARDS towards the camera
        const targetAngleX = -MAX_ANGLE * data.energy;

        const acceleration = (targetAngleX - data.angleX) * SPRING_STIFFNESS;
        data.velocity += acceleration;
        data.velocity *= SPRING_DAMPING;
        data.angleX += data.velocity;

        dummy.position.set(data.x, data.y, data.z);
        dummy.rotation.set(data.angleX, 0, 0);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
}

animate();
