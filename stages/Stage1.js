// ===== Stage1.js =====
import * as THREE from 'three';
import {
  addHemisphereLight,
  addDirectionalLight,
  addTexturedGround,
  addModel,
  addFloatingText,
  addSpeechBubble,
  addRoundedSpeechBubble,
  BlockEmitter,
  SphereEmitter,
  addGoldenSpiral,
  addPiano
} from '../Objects.js';
import { addCubeWithPhysics, addSphereWithPhysics } from '../PhysicsHelpers.js';

// フレームごとのデルタタイム計測用
const clock = new THREE.Clock();
window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer = null;

/**
 * Stage1 シーン要素をロード
 * @param {THREE.Scene} scene
 * @param {CANNON.World} physicsWorld
 * @param {Map<THREE.Mesh, CANNON.Body>} meshBodyMap
 * @param {THREE.WebGLRenderer} renderer
 * @param {CANNON.Body} playerBody
 * @param {Object} [opts] - 吹き出し座標などのオプション
 */
export function loadStage1(scene, physicsWorld, meshBodyMap, renderer, playerBody, opts = {}) {
  const squareBubblePos  = opts.squareBubblePos  || { x: 0,  y: 3,  z: -5 };
  const roundedBubblePos = opts.roundedBubblePos || { x: 10, y: 10, z: -5 };

  addHemisphereLight(scene, 0xffffff, 0x444444, 0.3, { x: 0, y: 50, z: 0 });
  addDirectionalLight(scene, 0xffffff, 0.5, { x: 10, y: 20, z: 10 });

  addTexturedGround(
    scene,
    './assets/textures/asphalt.jpg',
    { width: 100, height: 100 },
    { x: 0, y: 0, z: 0 },
    { x: 20, y: 20 }
  );

  addGoldenSpiral(scene, renderer, {
    turns: 6,
    height: 12,
    radius: 2,
    segments: 300,
    startY: 0,
    origin: { x: 0, y: 100, z: -5 }
  });

  addModel(scene, './assets/models/optimus.glb', { x: 0, y: 0, z: -5 }, { x: 1, y: 1, z: 1 });
  addFloatingText(scene, 'こんこん！', { x: 0, y: 2, z: -5 }, { size: 1, color: 'yellow' });

  addSpeechBubble(
    scene,
    '四角の吹き出し',
    squareBubblePos,
    { size: 1, color: 'white', background: 'rgba(0,0,0,0.8)', padding: 20 }
  );
  addRoundedSpeechBubble(
    scene,
    '角丸の吹き出し',
    roundedBubblePos,
    { size: 0.8, color: 'black', background: 'rgba(255,255,255,0.9)', padding: 20, cornerRadius: 30, tailSize: 15 }
  );

  addCubeWithPhysics(
    scene,
    physicsWorld,
    meshBodyMap,
    { x: -3, y: 0.5, z: 3 },
    { x: 1, y: 1, z: 1 },
    0xff0000
  );
  addSphereWithPhysics(
    scene,
    physicsWorld,
    meshBodyMap,
    { x: 3, y: 2, z: 3 },
    0.5,
    0x0000ff
  );

  scene.userData.blockEmitter1 = new BlockEmitter(
    scene,
    physicsWorld,
    meshBodyMap,
    {
      vectorFunc: (t) => {
        const r = 2.0;
        const θ = t * 1.5;
        return { x: r * Math.cos(θ), y: 1, z: r * Math.sin(θ) };
      },
      rate: 8,
      speed: 6,
      lifespan: 4
    }
  );

  scene.userData.blockEmitter2 = new BlockEmitter(
    scene,
    physicsWorld,
    meshBodyMap,
    {
      vectorFunc: (t) => {
        const r = 3.0;
        const θ = t;
        return { x: r * Math.cos(θ), y: 1, z: r * Math.sin(θ) };
      },
      rate: 8,
      speed: 6,
      lifespan: 4
    }
  );

  scene.userData.sphereEmitter1 = new SphereEmitter(
    scene,
    physicsWorld,
    meshBodyMap,
    { origin: { x: 0, y: 1, z: 0 }, rate: 10, speed: 4, lifespan: 3 }
  );
  scene.userData.sphereEmitter2 = new SphereEmitter(
    scene,
    physicsWorld,
    meshBodyMap,
    { origin: { x: -5, y: 1, z: 0 }, rate: 10, speed: 4, lifespan: 3 }
  );

  scene.onBeforeRender = () => {
    const delta = clock.getDelta();
    scene.userData.blockEmitter1.update(delta);
    scene.userData.blockEmitter2.update(delta);
    scene.userData.sphereEmitter1.update(delta);
    scene.userData.sphereEmitter2.update(delta);
  };

  addGoldenSpiral(scene, renderer, {
    turns: 6,
    height: 10,
    radius: 0.5,
    segments: 300
  });

  // サウンド読み込みとピアノ配置
  fetch('./assets/sounds/piano_note.wav')
    .then(res => res.arrayBuffer())
    .then(buf => audioContext.decodeAudioData(buf))
    .then(buffer => {
      audioBuffer = buffer;
      addPiano(scene, physicsWorld, meshBodyMap, audioContext, audioBuffer, playerBody);
    });
}