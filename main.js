import * as THREE from 'three';
import { World, Body, Plane, Sphere as CANNON_Sphere } from 'cannon-es';
import { createCamera, createControls } from './Camera.js';
import { Player } from './Player.js';
import { addCubeWithPhysics, addSphereWithPhysics } from './PhysicsHelpers.js';
import {
  addHemisphereLight,
  addDirectionalLight,
  addTexturedGround,
  addModel,
  addFloatingText,
  addSpeechBubble,
  BlockEmitter
} from './Objects.js';
import { loadStage1 } from './stages/Stage1.js';

let scene, camera, renderer, controls, player;
let physicsWorld, playerBody;
const meshBodyMap = new Map();
const clock = new THREE.Clock();
let lastCameraPos = new THREE.Vector3();

init();
animate();

function init() {
  // WebGLRenderer 初期化（最初に！）
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Three.js Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // 青空っぽい背景色
  scene.environment = null;

  // カメラ & コントロール
  camera = createCamera();
  const overlay = document.getElementById('overlay');
  controls = createControls(camera, document.body, overlay);
  scene.add(controls.getObject());

  // プレイヤー
  player = new Player(controls, 5.0);

  // Cannon-es 物理ワールド
  physicsWorld = new World();
  physicsWorld.gravity.set(0, -9.82, 0);

  // 地面（物理）
  const groundBody = new Body({ mass: 0 });
  groundBody.addShape(new Plane());
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  physicsWorld.addBody(groundBody);

  // ステージを読み込み（renderer を渡す）
  loadStage1(scene, physicsWorld, meshBodyMap, renderer, playerBody);

  // プレイヤー当たり判定用の球体（カメラ追従）
  playerBody = new Body({ mass: 0, type: Body.KINEMATIC });
  playerBody.addShape(new CANNON_Sphere(2)); // 半径 2
  playerBody.position.copy(camera.position);
  physicsWorld.addBody(playerBody);
  lastCameraPos.copy(camera.position);

  // リサイズ時の処理
  window.addEventListener('resize', onWindowResize);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // プレイヤー制御
  player.update(delta);

  // カメラ移動に合わせてプレイヤーの剛体を同期
  const camPos = camera.position;
  const vx = (camPos.x - lastCameraPos.x) / delta;
  const vy = (camPos.y - lastCameraPos.y) / delta;
  const vz = (camPos.z - lastCameraPos.z) / delta;
  playerBody.velocity.set(vx, vy, vz);
  lastCameraPos.copy(camPos);

  // 物理演算
  physicsWorld.step(1 / 60, delta, 3);

  // エミッターの更新
  if (scene.userData.blockEmitter) {
    scene.userData.blockEmitter.update(delta);
  }
  if (scene.userData.sphereEmitter) {
    scene.userData.sphereEmitter.update(delta);
  }

  // Three.js メッシュに物理位置を反映
  meshBodyMap.forEach((body, mesh) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  // レンダリング
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
