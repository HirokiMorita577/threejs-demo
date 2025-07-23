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
  BlockEmitter,
  rotateObjectY
} from './Objects.js';
import { loadStage1 } from '../stages/Stage1.js';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let pianoAudioBuffer = null; 

let scene, camera, renderer, controls, player;
let listener;
let physicsWorld, playerBody;
const meshBodyMap = new Map();
const clock = new THREE.Clock();
let lastCameraPos = new THREE.Vector3();

init();
animate();


window.addEventListener('click', () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}, { once: true });

function loadPianoSound() {
    fetch('./assets/sounds/piano.mp3')
        .then(res => res.arrayBuffer())
        .then(buf => audioContext.decodeAudioData(buf))
        .then(decoded => {
            pianoAudioBuffer = decoded;
            console.log("Piano sound loaded");
        })
        .catch(e => console.error("Failed to load sound", e));
}

loadPianoSound(); // ページ初期化時に呼び出し
const pianoSound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('./assets/sounds/piano.mp3', buffer => {
  pianoSound.setBuffer(buffer);
  pianoSound.setLoop(false);
  pianoSound.setVolume(0.5);
  loadStage1(scene, physicsWorld, meshBodyMap, renderer, playerBody, {
  pianoAudioBuffer: pianoAudioBuffer,
  squareBubblePos: { x: 0, y: 3, z: -5 }, // 必要であれば位置を調整
  roundedBubblePos: { x: 10, y: 10, z: -5 }
});
});
function init() {
  // WebGLRenderer 初期化（最初に！）
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Three.js Scene
  scene = new THREE.Scene();
  const loader = new THREE.CubeTextureLoader();
loader.load([
  'assets/sky/px.jpg',
  'assets/sky/nx.jpg',
  'assets/sky/py.jpg',
  'assets/sky/ny.jpg',
  'assets/sky/pz.jpg',
  'assets/sky/nz.jpg',
], function (texture) {
  scene.background = texture;
});
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

// 平行光（強め）
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);
  scene.environment = null;

  // カメラ & コントロール
  camera = createCamera();
     listener = new THREE.AudioListener();
  camera.add(listener);
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
  


  // プレイヤー当たり判定用の球体（カメラ追従）
  playerBody = new Body({ mass: 0, type: Body.KINEMATIC });
  playerBody.addShape(new CANNON_Sphere(2)); // 半径 2
  playerBody.position.copy(camera.position);
  physicsWorld.addBody(playerBody);
  lastCameraPos.copy(camera.position);

  // リサイズ時の処理
  window.addEventListener('resize', onWindowResize);
  const canvas = document.querySelector('canvas');
canvas.addEventListener('click', (event) => {
  if (event.target.closest('nav')) {
    event.stopPropagation(); // 視点ロックイベントを止める
    return;
  }
});
}
function checkPianoCollision(playerBody, meshBodyMap, audioContext, audioBuffer) {
  for (const [mesh, body] of meshBodyMap.entries()) {
    if (mesh.userData.isPianoKey) {
      const dx = body.position.x - playerBody.position.x;
      const dy = body.position.y - playerBody.position.y;
      const dz = body.position.z - playerBody.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 1.0 && !mesh.userData.hasPlayed) {
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();

        mesh.userData.hasPlayed = true;
        setTimeout(() => {
          mesh.userData.hasPlayed = false;
        }, 1000);
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // プレイヤー制御
  player.update(delta);

  if (meshBodyMap['piano']) {
    const pianoBody = meshBodyMap['piano'].body;
    const pianoPos = pianoBody.position;
    const playerPos = playerBody.position;

    // シンプルな当たり判定（XZ平面で近く、Yが上にある）
    const dx = playerPos.x - pianoPos.x;
    const dz = playerPos.z - pianoPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    const isOnTop = playerPos.y > pianoPos.y + 0.4 && distance < 1.0;

    if (isOnTop && pianoAudioBuffer && !window.__pianoPlayed) {
        playSound(audioContext, pianoAudioBuffer);
        window.__pianoPlayed = true; // 一度だけ再生
        console.log("🎶 ピアノ鳴った！");
    }

    if (!isOnTop) {
        window.__pianoPlayed = false; // 離れたらリセット
    }
}
  // カメラ移動に合わせてプレイヤーの剛体を同期
  const camPos = camera.position;
  const vx = (camPos.x - lastCameraPos.x) / delta;
  const vy = (camPos.y - lastCameraPos.y) / delta;
  const vz = (camPos.z - lastCameraPos.z) / delta;
  playerBody.velocity.set(vx, vy, vz);
  lastCameraPos.copy(camPos);

   if (scene.userData.autoRotateTargets) {
    scene.userData.autoRotateTargets.forEach(({ object, speed }) => {
      rotateObjectY(object, delta, speed);
    });
  }
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
     if (body && mesh && body.position && mesh.position) {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
     }
  });

  checkPianoCollision(playerBody, meshBodyMap, audioContext, pianoAudioBuffer);

  // レンダリング
  renderer.render(scene, camera);
  renderer.outputEncoding = THREE.sRGBEncoding;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
