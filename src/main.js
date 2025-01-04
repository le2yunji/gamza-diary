import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Stuff } from './Stuff';
import { Player } from './Player';
import { House } from './House';
import gsap from 'gsap';

// Texture - 바닥
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load('/images/grid.png');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.x = 10;
floorTexture.repeat.y = 10;

// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 그림자 부드럽게

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.OrthographicCamera(  // 직교 카메라 - 객체들이 어디있든지 동일하게 보여주는 카메라. 원근 x
	-(window.innerWidth / window.innerHeight), // left
	window.innerWidth / window.innerHeight, // right,
	1, // top
	-1, // bottom
	-1000,
	1000
);

const cameraPosition = new THREE.Vector3(1, 5, 5); // 카메라 위치
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
camera.zoom = 0.07; // OrthographicCamera는 줌 설정 가능
camera.updateProjectionMatrix();
scene.add(camera);

// Light
const ambientLight = new THREE.AmbientLight('white', 2.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('white', 0.5);
const directionalLightOriginPosition = new THREE.Vector3(1, 1, 1);
directionalLight.position.x = directionalLightOriginPosition.x;
directionalLight.position.y = directionalLightOriginPosition.y;
directionalLight.position.z = directionalLightOriginPosition.z;
directionalLight.castShadow = true; 

// mapSize 세팅으로 그림자 퀄리티 설정
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
// 그림자 범위
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.camera.near = -100;
directionalLight.shadow.camera.far = 100;
scene.add(directionalLight);

// Mesh
const meshes = [];
const floorMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(100, 100),
	new THREE.MeshStandardMaterial({
		map: floorTexture
	})
);
floorMesh.name = 'floor';
floorMesh.rotation.x = -Math.PI/2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);
meshes.push(floorMesh);

const pointerMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(1, 1),
	new THREE.MeshBasicMaterial({
		color: 'crimson',
		transparent: true,
		opacity: 0.5
	})
);
pointerMesh.rotation.x = -Math.PI/2;
pointerMesh.position.y = 0.01;
pointerMesh.receiveShadow = true;
scene.add(pointerMesh);

const spotMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(3, 3),
	new THREE.MeshStandardMaterial({
		color: 'yellow',
		transparent: true,
		opacity: 0.5
	})
);
spotMesh.position.set(5, 0.005, 5);
spotMesh.rotation.x = -Math.PI/2;
spotMesh.receiveShadow = true;
scene.add(spotMesh);

const gltfLoader = new GLTFLoader();

// 하우스
const house = new House({
	gltfLoader,
	scene,
	modelSrc: '/models/isometric_room.glb',
	x: 15,
	y: -10.3,
	z: 10,
	rotationY: Math.PI
});

// 플레이어
const player = new Player({
	scene,
	meshes,
	gltfLoader,
	modelSrc: '/models/Gamza_Walk_lightO.glb',
	rotationY: Math.PI/2,
});

const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let destinationPoint = new THREE.Vector3();
let angle = 0;
let isPressed = false; // 마우스를 누르고 있는 상태

// 그리기
const clock = new THREE.Clock();

function draw() {
	const delta = clock.getDelta();

	if (player.mixer) player.mixer.update(delta);

	if (player.modelMesh) {
		camera.lookAt(player.modelMesh.position);
	}

	if (player.modelMesh) {

		if (isPressed) {
			raycasting();    // 마우스를 누르는 동안 계속 래이캐스팅
		}

		// checkIntersects 함수에서 moving = true 로 설정해줬음. 
		if (player.moving) {
			// 걸어가는 상태

			// 현재 위치와 목표지점의 거리를 통해 각도 계산
			angle = Math.atan2(
				destinationPoint.z - player.modelMesh.position.z,
				destinationPoint.x - player.modelMesh.position.x
			);
			// 구한 각도를 이용해 좌표를 구하고 그 좌표로 이동
			player.modelMesh.position.x += Math.cos(angle) * 0.1;
			player.modelMesh.position.z += Math.sin(angle) * 0.1;

			// 카메라도 같이 이동
			camera.position.x = cameraPosition.x + player.modelMesh.position.x;
			camera.position.z = cameraPosition.z + player.modelMesh.position.z;
			
			// player.actions[0].stop();
			player.actions[1].play();
			
			
			if (  // 목표 지점과 현재 지점이 0.03 보다 작으면
				Math.abs(destinationPoint.x - player.modelMesh.position.x) < 0.03 &&    
				Math.abs(destinationPoint.z - player.modelMesh.position.z) < 0.03
			) {   // 멈춤 상태
				player.moving = false;
				console.log('멈춤');
			}

			if (   // 노란색 포인트 지점(3*3사각형) 안에 도달시 
				Math.abs(spotMesh.position.x - player.modelMesh.position.x) < 1.5 &&
				Math.abs(spotMesh.position.z - player.modelMesh.position.z) < 1.5
			) {    // house.visible = false 가 아닐 시
				if (!house.visible) {
					console.log('나와');
					house.visible = true;
					spotMesh.material.color.set('seagreen');
					// house 매쉬 튀어 나옴
					gsap.to(
						house.modelMesh.position,
						{
							duration: 1,
							y: 1,
							ease: 'Bounce.easeOut'   // 튀어나옴 효과. 라이브러리가 가지고 있는 값.
						}
					);
					// 카메라 각도 변환
					gsap.to(
						camera.position,
						{
							duration: 1,
							y: 3
						}
					);
				}
				// house가 visible 상태라면
			} else if (house.visible) {
				console.log('들어가');
				house.visible = false;
				spotMesh.material.color.set('yellow');
				gsap.to(
					house.modelMesh.position,
					{
						duration: 0.5,
						y: -10.3,
					}
				);
				gsap.to(
					camera.position,
					{
						duration: 1,
						y: 5
					}
				);
			}
		} else {
			// 서 있는 상태
			player.actions[1].stop(); // 걸어가는 상태 멈춤
			// player.actions[0].play();
		}
	}

	renderer.render(scene, camera);
	renderer.setAnimationLoop(draw);
}
// 좌표 얻어내는 함수
function checkIntersects() {
	// raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObjects(meshes);
	for (const item of intersects) {
		if (item.object.name === 'floor') {   // 바닥을 클릭했을 때
			destinationPoint.x = item.point.x;  // destinationPoint 목표 지점
			destinationPoint.y = 0.3; // 위아래로는 움직이지 않기때문에 고정값
			destinationPoint.z = item.point.z;
			player.modelMesh.lookAt(destinationPoint);  // 광선이 맞은 포인트 위치를 바라봄
            player.modelMesh.rotation.y += Math.PI; // 180도 회전 추가 (필요하면 조정)

			// console.log(item.point)

			player.moving = true;

			pointerMesh.position.x = destinationPoint.x;
			pointerMesh.position.z = destinationPoint.z;
		}
		break;
	}
}

function setSize() {
	camera.left = -(window.innerWidth / window.innerHeight);
	camera.right = window.innerWidth / window.innerHeight;
	camera.top = 1;
	camera.bottom = -1;

	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);
}

// 이벤트
window.addEventListener('resize', setSize);

// 마우스 좌표를 three.js에 맞게 변환 
function calculateMousePosition(e) {
	mouse.x = e.clientX / canvas.clientWidth * 2 - 1;
	mouse.y = -(e.clientY / canvas.clientHeight * 2 - 1);
}

// 변환된 마우스 좌표를 이용해 래이캐스팅
function raycasting() {
	raycaster.setFromCamera(mouse, camera);
	checkIntersects();
}

// 마우스 이벤트
canvas.addEventListener('mousedown', e => {
	isPressed = true;			 // 마우스 눌렀을 때
	calculateMousePosition(e);   // 마우스 눌렀을 때 calculateMousePosition함수(마우스 좌표) 호출 
});
canvas.addEventListener('mouseup', () => {
	isPressed = false;			// 마우스 뗐을 때
});
canvas.addEventListener('mousemove', e => {
	if (isPressed) {
		calculateMousePosition(e);  // 드래그
	}
});

// 터치 이벤트 -> 모바일 사용시
canvas.addEventListener('touchstart', e => {
	isPressed = true;
	calculateMousePosition(e.touches[0]);    
});
canvas.addEventListener('touchend', () => {
	isPressed = false;
});
canvas.addEventListener('touchmove', e => {
	if (isPressed) {
		calculateMousePosition(e.touches[0]);
	}
});

draw();