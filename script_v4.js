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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
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
backPlane.position.z = -5; // Push back slightly to accommodate 3D scales
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

// 2. Build 3D Extruded Scale Geometry
const cols = 22; 
const colSpacing = bounds.width / (cols - 1);
const rows = 35;
const rowSpacing = bounds.height / (rows - 1);

const scaleWidth = colSpacing * 1.4; // Wide enough to perfectly interlock without gaps
const scaleHeight = rowSpacing * 1.8; // Tall enough to shingle completely

const shape = new THREE.Shape();
// Hinge at top (0, 0)
shape.moveTo(0, 0);
// Right side curves down and out to widest point, then tapers to bottom
shape.bezierCurveTo(scaleWidth * 0.6, -scaleHeight * 0.1, scaleWidth * 0.5, -scaleHeight * 0.7, 0, -scaleHeight);
// Left side curves back up
shape.bezierCurveTo(-scaleWidth * 0.5, -scaleHeight * 0.7, -scaleWidth * 0.6, -scaleHeight * 0.1, 0, 0);

const extrudeSettings = {
    steps: 1,
    depth: 0.15, // Real 3D physical thickness
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.05,
    bevelSegments: 3
};
const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
geometry.computeVertexNormals();

// We use a high-gloss biological material. Color will be applied per-instance.
const material = new THREE.MeshStandardMaterial({ 
    roughness: 0.25,
    metalness: 0.15
});

const count = cols * rows;
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
instancedMesh.castShadow = true;
instancedMesh.receiveShadow = true; // They are 3D now, so they should cast shadows on each other!
scene.add(instancedMesh);

const scalesData = [];
const dummy = new THREE.Object3D();
const color = new THREE.Color();
let instanceIdx = 0;

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        let x = startX + (col * colSpacing);
        if (row % 2 !== 0) {
            x += colSpacing / 2; // Interlocking zig-zag pattern
        }
        
        const y = startY - (row * rowSpacing);
        
        // Proper anatomical shingling: lower scales overlap upper scales
        // So Z increases as row increases (bringing it closer to the camera)
        const z = row * 0.05 + (col % 2) * 0.01;

        dummy.position.set(x, y, z);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(instanceIdx, dummy.matrix);

        // Gradient coloring: Bright yellow/green spine, fading to dark forest green edges
        const distFromCenter = Math.abs(x) / (bounds.width / 2);
        color.lerpColors(new THREE.Color(0xaacc11), new THREE.Color(0x052205), distFromCenter);
        
        // Add a tiny bit of random noise to color so it looks organic
        const noise = (Math.random() - 0.5) * 0.05;
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

// Tight radius so only the scale directly under the cursor lifts
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
            
            // Interaction point is slightly below the hinge for best feel
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
        
        // Hinge FORWARD (towards the camera) by using a NEGATIVE angle rotation on X axis
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
