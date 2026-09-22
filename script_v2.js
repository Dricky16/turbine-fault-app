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

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
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
backPlane.position.z = -2;
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

// 2. Load Texture & Bump Map
const textureLoader = new THREE.TextureLoader();
const snakeSkinMap = textureLoader.load('snakeskin.jpg');
snakeSkinMap.colorSpace = THREE.SRGBColorSpace;

const material = new THREE.MeshStandardMaterial({ 
    map: snakeSkinMap,
    bumpMap: snakeSkinMap, 
    bumpScale: 0.4, 
    roughness: 0.5,
    metalness: 0.1,
    side: THREE.DoubleSide
});

// 3. Load the pre-calculated exact contours of the snake scales
let meshesData = [];

fetch('scales_v2.json')
    .then(response => response.json())
    .then(scales => {
        buildExactScaleSkin(scales);
    })
    .catch(err => console.error("Error loading scales_v2.json:", err));

function buildExactScaleSkin(scales) {
    // Expand geometries heavily from their centers to ensure absolute complete overlap
    // This perfectly seals all gaps and completely hides the red lava when resting.
    const scaleMult = 1.65; 

    for (let i = 0; i < scales.length; i++) {
        const scale = scales[i];
        if (scale.points.length < 3) continue;

        const rawCenterX = startX + scale.center.x * bounds.width;
        const rawCenterY = startY - scale.center.y * bounds.height;

        // Expand the polygon points outwards from the center of the scale
        const expandedPoints = [];
        let maxExpandedY = -Infinity; 
        
        for (const p of scale.points) {
            const rawWorldX = startX + p.x * bounds.width;
            const rawWorldY = startY - p.y * bounds.height; // Y flips because WebGL up is positive
            
            const exX = rawCenterX + (rawWorldX - rawCenterX) * scaleMult;
            const exY = rawCenterY + (rawWorldY - rawCenterY) * scaleMult;
            
            expandedPoints.push({ x: exX, y: exY });
            
            if (exY > maxExpandedY) {
                maxExpandedY = exY;
            }
        }

        // Establish the hinge point at the highest tip of the newly expanded polygon
        const hingeWorldX = rawCenterX;
        const hingeWorldY = maxExpandedY;
        
        // Build the precise shape polygon relative to the hinge
        const shape = new THREE.Shape();
        for (let j = 0; j < expandedPoints.length; j++) {
            const p = expandedPoints[j];
            const vx = p.x - hingeWorldX;
            const vy = p.y - hingeWorldY;
            
            if (j === 0) shape.moveTo(vx, vy);
            else shape.lineTo(vx, vy);
        }
        
        const geometry = new THREE.ShapeGeometry(shape);
        const pos = geometry.attributes.position;
        const uvs = new Float32Array(pos.count * 2);
        
        // Bake perfect UVs into the geometry based on their absolute expanded world positions
        for (let j = 0; j < pos.count; j++) {
            const vx = pos.getX(j);
            const vy = pos.getY(j);
            
            const worldX = hingeWorldX + vx;
            const worldY = hingeWorldY + vy;
            
            const uvX = (worldX - startX) / bounds.width;
            const uvY = (worldY - (startY - bounds.height)) / bounds.height;
            
            uvs[j*2] = uvX;
            uvs[j*2+1] = uvY;
        }
        
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        geometry.computeVertexNormals();
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Shingling: lower scales on screen (higher center.y) overlap upper ones
        const z = scale.center.y * 0.8; 
        
        mesh.position.set(hingeWorldX, hingeWorldY, z);
        mesh.scale.set(1, 1, 1); // No scaling needed, we pre-expanded the polygon points!
        mesh.castShadow = true;
        mesh.receiveShadow = false;
        
        scene.add(mesh);
        
        meshesData.push({
            mesh: mesh,
            centerX: rawCenterX,
            centerY: rawCenterY,
            angleX: 0,
            velocity: 0,
            energy: 0
        });
    }

    startPhysicsLoop();
}

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

function startPhysicsLoop() {
    const SPRING_STIFFNESS = 0.20;
    const SPRING_DAMPING = 0.82;
    const ENERGY_DECAY = 0.88; 
    
    // An extremely precise, tight radius so ONLY the scale under the cursor hinges
    const INFLUENCE_RADIUS = bounds.width / 22.0; 
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
            for (let i = 0; i < meshesData.length; i++) {
                const data = meshesData[i];
                // Check distance to the exact center of this specific scale
                const dx = data.centerX - currentIntersection.x;
                const dy = data.centerY - currentIntersection.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < INFLUENCE_RADIUS * INFLUENCE_RADIUS) {
                    const dist = Math.sqrt(distSq);
                    const factor = 1 - (dist / INFLUENCE_RADIUS);
                    data.energy = Math.min(1.0, data.energy + mouseSpeed * factor * 3.0);
                }
            }
        }

        lastIntersection.copy(currentIntersection);

        for (let i = 0; i < meshesData.length; i++) {
            const data = meshesData[i];

            data.energy *= ENERGY_DECAY;
            const targetAngleX = MAX_ANGLE * data.energy;

            const acceleration = (targetAngleX - data.angleX) * SPRING_STIFFNESS;
            data.velocity += acceleration;
            data.velocity *= SPRING_DAMPING;
            data.angleX += data.velocity;

            // Apply physical hinge rotation
            data.mesh.rotation.x = data.angleX;
        }

        renderer.render(scene, camera);
    }

    animate();
}
