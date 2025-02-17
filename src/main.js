import * as THREE from 'three';
// import * as BufferGeometryUtils from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Player } from './Player';
import { House } from './House';
import { Table } from './Table';
import gsap from 'gsap';
import { GUI } from 'dat.gui'
import { Classroom } from './Classroom';
import { Classroomgamza } from './ClassroomGamza';
import { Onion } from './Onion';

// Texture - 바닥
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load('/images/grid.png');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.x = 50;
floorTexture.repeat.y = 50;


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

// AxesHelper
const axesHelper = new THREE.AxesHelper(100); // 축 크기
axesHelper.position.y = 3
scene.add(axesHelper);


// Camera
const camera = new THREE.OrthographicCamera(  // 직교 카메라 - 객체들이 어디있든지 동일하게 보여주는 카메라. 원근 x
	-(window.innerWidth / window.innerHeight), // left
	window.innerWidth / window.innerHeight, // right,
	1, // top
	-1, // bottom
	-1000,
	1000
);

const cameraPosition = new THREE.Vector3(2, 6, 5); // 카메라 위치
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
camera.zoom = 0.045; // OrthographicCamera는 줌 설정 가능
camera.updateProjectionMatrix();
scene.add(camera);

// GUI
const gui = new GUI();
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera, 'zoom', 0.01, 0.1, 0.001) // 줌 범위 설정 (최소값, 최대값, 스텝)
	.name('Zoom')
	.onChange(() => {
		camera.updateProjectionMatrix(); // 줌 변경 후 업데이트 필요
	});
cameraFolder.open();

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
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
// 그림자 범위
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.camera.near = -100;
directionalLight.shadow.camera.far = 100;
scene.add(directionalLight);


// 강의실 전등
const classroomLight = new THREE.PointLight('white', 10, 100, 1.3); 
classroomLight.position.set(6, 7, 10)
const lightHelper = new THREE.PointLightHelper(classroomLight);

// 그림자 설정
classroomLight.castShadow = true;
classroomLight.shadow.camera.left = -1;
classroomLight.shadow.camera.right = 1;
classroomLight.shadow.camera.top = 1;
classroomLight.shadow.camera.bottom = -1;
classroomLight.shadow.mapSize.width = 1024; // 기본값 = 512
classroomLight.shadow.mapSize.height = 1024;
classroomLight.shadow.camera.near = 1;
classroomLight.shadow.camera.far = 5;

// Controls
// const controls = new OrbitControls(camera, renderer.domElement);

// Mesh
const meshes = [];    // 레이캐스팅을 위한 배열. meshes 안에 들어가야 상호작용됨. 
const floorMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(1000, 1000),
	new THREE.MeshStandardMaterial({
		map: floorTexture
	})
);
floorMesh.name = 'floor';
floorMesh.rotation.x = -Math.PI/2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);
meshes.push(floorMesh);

// 포인터 매쉬
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

// 하우스 스팟 메쉬
const houseSpotMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(3, 3),
	new THREE.MeshStandardMaterial({
		color: 'yellow',
		transparent: true,
		opacity: 0.5
	})
);
houseSpotMesh.position.set(50, 0.005, 5);
houseSpotMesh.rotation.x = -Math.PI/2;
houseSpotMesh.receiveShadow = true;
scene.add(houseSpotMesh);


// 강의실 스팟 메쉬
const tableSpotMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(3, 3),
	new THREE.MeshStandardMaterial({
		color: 'skyblue',
		transparent: true,
		opacity: 0.5
	})
);
tableSpotMesh.position.set(20, 0.005, 10);
tableSpotMesh.rotation.x = -Math.PI/2;
tableSpotMesh.receiveShadow = true;
scene.add(tableSpotMesh);


// 발표 스팟 메쉬
const presentSpotMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2),
	new THREE.MeshStandardMaterial({
		color: 'royalblue',
		transparent: true,
		opacity: 0.5,
	})
); 
presentSpotMesh.position.set(20, 0.005, 20);
presentSpotMesh.rotation.x = -Math.PI/2;
presentSpotMesh.receiveShadow = true;


const gltfLoader = new GLTFLoader();



// ppt화면
const pptTexture1 = new THREE.TextureLoader().load('./images/ppt1.png')
const pptTexture2 = new THREE.TextureLoader().load('./images/ppt2.png')
const pptTexture3 = new THREE.TextureLoader().load('./images/ppt3.png')

const planeGeometry = new THREE.PlaneGeometry(9.6, 5.4)

const pptMaterial1 = new THREE.MeshBasicMaterial({
	map: pptTexture1,
});
const pptMaterial2 = new THREE.MeshBasicMaterial({
	map: pptTexture2,
});
const pptMaterial3 = new THREE.MeshBasicMaterial({
	map: pptTexture3,
});

const ppt1 = new THREE.Mesh(planeGeometry, pptMaterial1);
const ppt2 = new THREE.Mesh(planeGeometry, pptMaterial2);
const ppt3 = new THREE.Mesh(planeGeometry, pptMaterial3);

ppt1.position.set(6.35, 5.45, 4.6)
ppt1.scale.set(1.435, 1.45, 1.45)
ppt2.position.set(6.4, 5.5, 4.8)
ppt3.position.set(6.5, 5.5, 4.8)

scene.add(ppt1, ppt2, ppt3);

ppt1.visible = false
ppt2.visible = false
ppt3.visible = false


// 감자 머리 위 삼각형
const triangleTexture = new THREE.TextureLoader().load('./images/triangle2.png')
const trianglePlaneGeometry = new THREE.PlaneGeometry(1, 1);
const triangleMaterial = new THREE.MeshBasicMaterial({
	map: triangleTexture,
	transparent: true, // PNG의 투명도 반영
	alphaTest: 0.5 // 알파 값 기준
});
triangleTexture.colorSpace = THREE.SRGBColorSpace; // sRGB 색 공간 설정
triangleTexture.needsUpdate = true;
const triangle = new THREE.Mesh(trianglePlaneGeometry, triangleMaterial);
triangle.position.y = 2
scene.add(triangle);


// 화살표
// const arrowTexture = new THREE.TextureLoader().load('./images/arrow.png')
// const arrowPlaneGeometry = new THREE.PlaneGeometry(3, 3);
// const arrowMaterial = new THREE.MeshBasicMaterial({
// 	map: arrowTexture,
// 	transparent: true, // PNG의 투명도 반영
// 	alphaTest: 0.5 // 알파 값 기준
// });
// arrowTexture.colorSpace = THREE.SRGBColorSpace; // sRGB 색 공간 설정
// arrowTexture.needsUpdate = true;
// const arrow = new THREE.Mesh(arrowPlaneGeometry, arrowMaterial);
// arrow.position.x = 11
// arrow.position.z = 7
// arrow.position.y = 2
// arrow.visible = false;
// scene.add(arrow);



// 강의실
const classroom = new Classroom({
	gltfLoader,
	scene,
	modelSrc: '/models/s4_classroom.glb',
	x: 0,
	y: -10.3,
	// y: 5.05,
	z: 10,
	rotationY: THREE.MathUtils.degToRad(90),
	scaleX: 1.5,
	// scaleY: 1,
	// scaleX: 1.5
});

// 책걸상
const table1 = new Table({
	gltfLoader,
	scene,
	modelSrc: '/models/table-chair-set.glb',
	x: 4,
	y: 1.5,
	z: 16,
	// scaleX: 0.9,
	// scaleY: 0.9,
	// scaleZ: 0.9
});
const table2 = new Table({
	gltfLoader,
	scene,
	modelSrc: '/models/table-chair-set.glb',
	x: 11,
	y: 1.5,
	z: 16,
	// scaleX: 0.9,
	// scaleY: 0.9,
	// scaleZ: 0.9
});
const table3 = new Table({
	gltfLoader,
	scene,
	modelSrc: '/models/table-chair-set.glb',
	x: 4,
	y: 1.5,
	z: 21,
	// scaleX: 0.9,
	// scaleY: 0.9,
	// scaleZ: 0.9
});
const table4 = new Table({
	gltfLoader,
	scene,
	modelSrc: '/models/table-chair-set.glb',
	x: 11,
	y: 1.5,
	z: 21,
	// scaleX: 0.9,
	// scaleY: 0.9,
	// scaleZ: 0.9
});


// 플레이어
const player = new Player({
	scene,
	meshes,
	gltfLoader,
	modelSrc: '/models/Gamza_Walk_lightO.glb',
	rotationY: Math.PI/2,
});


// 양파교수
const onion = new Onion({
	scene,
	meshes,
	gltfLoader,
	modelSrc: '/models/s4_onion.glb',
	// rotationY: Math.PI/2,
	x: 5,
	y: 5,
	z: 5
});

// 플레이어
// const classroomgamza = new Classroomgamza({
// 	scene,
// 	meshes,
// 	gltfLoader,
// 	modelSrc: '/models/Gamza_Walk_lightO.glb',
// 	rotationY: Math.PI/2,
// });

const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let destinationPoint = new THREE.Vector3();
let angle = 0;
let isPressed = false; // 마우스를 누르고 있는 상태

// 그리기
const clock = new THREE.Clock();

function draw() {
	const delta = clock.getDelta();
	const elapsedTime = clock.getElapsedTime(); // 전체 경과 시간

	if (player.mixer) player.mixer.update(delta);

	if (player.modelMesh) {
		camera.lookAt(player.modelMesh.position);
	}

	if (player.modelMesh) {

		if (triangle) {
			// Y 좌표를 부드럽게 오르락내리락
			triangle.position.y = 5.5 + Math.sin(elapsedTime * 3) * 0.4; // 3.5 ~ 4.5 범위에서 움직임
		}

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
			player.modelMesh.position.x += Math.cos(angle) * 0.2;  // 걷는 속도
			player.modelMesh.position.z += Math.sin(angle) * 0.2;
			
			// 머리 위 삼각형도 따라가기
			if (triangle) {
				triangle.position.x = player.modelMesh.position.x;
				triangle.position.z = player.modelMesh.position.z;
			}

			// 카메라도 같이 이동
			camera.position.x = cameraPosition.x + player.modelMesh.position.x;
			camera.position.z = cameraPosition.z + player.modelMesh.position.z;
			

			// player.actions[0].stop();
			player.actions[1].play();
			
			
			if (  // 목표 지점과 현재 지점이 0.1 보다 작으면
				Math.abs(destinationPoint.x - player.modelMesh.position.x) < 0.1 &&    
				Math.abs(destinationPoint.z - player.modelMesh.position.z) < 0.1
			) {   // 멈춤 상태
				player.moving = false;
				// console.log('멈춤');
			}
			

			// 강의실 인터랙션
			if (   // 파란색 포인트 지점(3*3사각형) 안에 도달시 
			Math.abs(tableSpotMesh.position.x - player.modelMesh.position.x) < 1.5 &&
			Math.abs(tableSpotMesh.position.z - player.modelMesh.position.z) < 1.5
			){
				if(!classroom.visible){
					classroom.visible = true;
					tableSpotMesh.material.color.set('seagreen');
					// classroom 매쉬 튀어 나옴
					gsap.to(
						classroom.modelMesh.position,
						{
							duration: 1,
							y: 5.05,
							ease: 'Bounce.easeOut',   // 튀어나옴 효과. 라이브러리가 가지고 있는 값.
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
					
					setTimeout(()=>{
						scene.add(classroomLight);
						scene.add(lightHelper);
					}, 1000)

					setTimeout(()=>{
						ppt1.visible = true;
						ppt2.visible = false;
						ppt3.visible = false;
					}, 1000)

					setTimeout(()=>{
						table1.visible = true;
					}, 3000)

						
					
						// arrow.visible = true;

						scene.add(presentSpotMesh);

						// table 매쉬 튀어 나옴
						gsap.to(
							table1.modelMesh.scale,
							{
								duration: 1,
								x: 2.5,
								y: 3,
								z: 2.5,
								ease: 'Bounce.easeOut'   // 튀어나옴 효과. 라이브러리가 가지고 있는 값.
							}
						);
						gsap.to(
							table2.modelMesh.scale,
							{
								duration: 1.2,
								x: 2.5,
								y: 3,
								z: 2.5,
								ease: 'Bounce.easeOut'   // 튀어나옴 효과. 라이브러리가 가지고 있는 값.
							}
						);
						gsap.to(
							table3.modelMesh.scale,
							{
								duration: 1.3,
								x: 2.5,
								y: 3,
								z: 2.5,
								ease: 'Bounce.easeOut'   // 튀어나옴 효과. 라이브러리가 가지고 있는 값.
							}
						);
						gsap.to(
							table4.modelMesh.scale,
							{
								duration: 1.4,
								x: 2.5,
								y: 3,
								z: 2.5,
								ease: 'Bounce.easeOut'   // 튀어나옴 효과. 라이브러리가 가지고 있는 값.
							}
						);
						gsap.to(
							ppt1,
							{
								duration: 1.4,
								ease: 'Bounce.easeOut'   // 튀어나옴 효과. 라이브러리가 가지고 있는 값.
							}
						);
		
					tableSpotMesh.material.color.set('skyblue');
					
					// 발표 인터랙션
					if (   // 파란색 포인트 지점(3*3사각형) 안에 도달시 
					Math.abs(presentSpotMesh.position.x - player.modelMesh.position.x) < 1 &&
					Math.abs(presentSpotMesh.position.z - player.modelMesh.position.z) < 1
					) { 
						presentSpotMesh.material.color.set('seagreen');
						// arrow.visible = false;
						player.moving = false;
						triangle.visible = false;
						// player 사라짐
						gsap.to(
							player.modelMesh.scale,
							{
								duration: 0.6,
								x: 0,
								y: 0,
								z: 0,
								ease: 'expo.easeOut'   // 튀어나옴 효과. 라이브러리가 가지고 있는 값.
							}
						);
		
						// 마우스 이벤트 비활성화
						disableMouseEvents();
		
					}
				}
			}
	    } else {
			player.moving = false;
			// 서 있는 상태
			player.actions[1].stop(); // 걸어가는 상태 멈춤
			// player.actions[0].play();
		}
		

	}
	renderer.render(scene, camera);
	renderer.setAnimationLoop(draw);
}













/////// -------------------- 건들지 않는 부분 -------------------------

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

			player.moving = true;

			pointerMesh.position.x = destinationPoint.x;
			pointerMesh.position.z = destinationPoint.z;

			console.log(destinationPoint.x, destinationPoint.z)
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

// 마우스 이벤트 핸들러 정의
function onMouseDown(e) {
    isPressed = true;
    calculateMousePosition(e);
}

function onMouseUp() {
    isPressed = false;
}

function onMouseMove(e) {
    if (isPressed) {
        calculateMousePosition(e);
    }
}

function onTouchStart(e) {
    isPressed = true;
    calculateMousePosition(e.touches[0]);
}

function onTouchEnd() {
    isPressed = false;
}

function onTouchMove(e) {
    if (isPressed) {
        calculateMousePosition(e.touches[0]);
    }
}


// 이벤트 등록
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('touchstart', onTouchStart);
canvas.addEventListener('touchend', onTouchEnd);
canvas.addEventListener('touchmove', onTouchMove);


// 마우스 이벤트 제거 함수
function disableMouseEvents() {
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchend', onTouchEnd);
    canvas.removeEventListener('touchmove', onTouchMove);
}

// 마우스 이벤트 활성화 함수
function enableMouseEvents() {
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchmove', onTouchMove);
}

draw();
