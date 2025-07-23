// ===== Stage1.js =====
import * as THREE from 'three';
import {
  addHemisphereLight,
  addDirectionalLight,
  addTexturedGround,
  addModel,
  addFBXModel,
  addFloatingText,
  addSpeechBubble,
  addRoundedSpeechBubble,
  BlockEmitter,
  SphereEmitter,
  addGoldenSpiral,
  addPiano,
  rotateObjectY,
  addPianoKey
} from '../js/Objects.js';
import { addCubeWithPhysics, addSphereWithPhysics } from '../js/PhysicsHelpers.js';
import * as CANNON from 'cannon-es';


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
  opts = opts || {}; // null 対策
  const squareBubblePos  = opts.squareBubblePos  || { x: 0,  y: 3,  z: -5 };
  const roundedBubblePos = opts.roundedBubblePos || { x: 10, y: 10, z: -5 };

  addHemisphereLight(scene, 0xffffff, 0x444444, 0.3, { x: 0, y: 50, z: 0 });
  addDirectionalLight(scene, 0xffffff, 0.5, { x: 10, y: 20, z: 10 });

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // 音読み込み
  fetch('./assets/sounds/piano.mp3')
    .then(res => res.arrayBuffer())
    .then(data => audioContext.decodeAudioData(data))
    .then(buffer => {
   audioBuffer = buffer;
   addPiano(scene, physicsWorld, meshBodyMap, audioContext, audioBuffer, playerBody);
 });

  // 配置


  addTexturedGround(
    scene,
    './assets/textures/asphalt.jpg',
    { width: 100, height: 100 },
    { x: 0, y: 0, z: 0 },
    { x: 20, y: 20 }
  );

  physicsWorld.addEventListener('postStep', () => {
  physicsWorld.contacts.forEach(contact => {
    const bi = contact.bi;
    const bj = contact.bj;

    [bi, bj].forEach(body => {
      if (body.noteBuffer && !body.playedRecently) {
        const source = audioContext.createBufferSource();
        source.buffer = body.noteBuffer;
        source.connect(audioContext.destination);
        source.start();

        body.playedRecently = true;

        // 短時間後に再び再生できるようにする（デバウンス）
        setTimeout(() => {
          body.playedRecently = false;
        }, 300); // 300ms 再生間隔
      }
    });
  });
  
});
  addGoldenSpiral(scene, renderer, {
    turns: 6,
    height: 12,
    radius: 2,
    segments: 300,
    startY: 0,
    origin: { x: 0, y: 100, z: -5 }
  });

  addModel(scene, './assets/models/optimus.glb', { x: 0, y: 0, z: -15 }, { x: 0.25, y: 0.25, z: 0.25 },{ x: 0, y: Math.PI / 3, z: 0 },{ autoRotateY: 1.5 });
  addModel(scene, './assets/models/optimus.glb', { x: 0, y: 0, z: -45 }, { x: 2, y: 2, z: 2 },{ x: 0, y: 0 , z: 0 });
  addModel(scene, './assets/models/optimus.glb', { x: 0, y: 0, z: -75 }, { x: 2, y: 2, z: 2 },{ x: 0, y: 0 , z: 0 });
  for (let i = 0; i < 50; i += 5) {
  for (let i = 0; i < 50; i += 5) {
    addModel(scene, './assets/models/takio.glb',
      { x: 2.5, y: 0.65, z: 2.5 - i },
      { x: 0.5, y: 0.5, z: 0.5 },
      { x: 0, y: Math.PI, z: Math.PI }
    );

    addModel(scene, './assets/models/takio.glb',
      { x: -2.5, y: -0.65, z: 2.5 - i },
      { x: 0.5, y: 0.5, z: 0.5 },
      { x: 0, y: 0, z: 0 }
    );
  }

  addFloatingText(scene, 'ハローワールド！', { x: 0, y: 2, z: -2 }, { size: 1, color: 'yellow' });

  // 💡 吹き出し表示前に空のメッシュを追加してエラー防止
  const squareBubbleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), new THREE.MeshBasicMaterial({ visible: false }));
  squareBubbleMesh.position.set(squareBubblePos.x, squareBubblePos.y, squareBubblePos.z);
  scene.add(squareBubbleMesh);
  meshBodyMap.set(squareBubbleMesh, null);

  const roundedBubbleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), new THREE.MeshBasicMaterial({ visible: false }));
  roundedBubbleMesh.position.set(roundedBubblePos.x, roundedBubblePos.y, roundedBubblePos.z);
  scene.add(roundedBubbleMesh);
  meshBodyMap.set(roundedBubbleMesh, null);

  // 吹き出し描画
  addSpeechBubble(
    scene,
    'Let’s enjoy!',
    squareBubblePos,
    { size: 1, color: 'white', background: 'rgba(0,0,0,0.8)', padding: 20 }
  );
  addRoundedSpeechBubble(
    scene,
    'こんにちは！',
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

  scene.userData.blockEmitter1 = new BlockEmitter(scene, physicsWorld, meshBodyMap, {
    vectorFunc: (t) => {
      const r = 2.0;
      const θ = t * 1.5;
      return { x: r * Math.cos(θ), y: 1, z: r * Math.sin(θ) };
    },
    rate: 8,
    speed: 6,
    lifespan: 4
  });

  scene.userData.blockEmitter2 = new BlockEmitter(scene, physicsWorld, meshBodyMap, {
    vectorFunc: (t) => {
      const r = 3.0;
      const θ = t;
      return { x: r * Math.cos(θ), y: 1, z: r * Math.sin(θ) };
    },
    rate: 8,
    speed: 6,
    lifespan: 4
  });

  scene.userData.sphereEmitter1 = new SphereEmitter(scene, physicsWorld, meshBodyMap, {
    origin: { x: 0, y: 1, z: 0 }, rate: 10, speed: 4, lifespan: 3
  });
  scene.userData.sphereEmitter2 = new SphereEmitter(scene, physicsWorld, meshBodyMap, {
    origin: { x: -5, y: 1, z: 0 }, rate: 10, speed: 4, lifespan: 3
  });

  scene.onBeforeRender = () => {
    const delta = clock.getDelta();
    // 各エミッタの更新処理を入れたければここで行う
  };

  addGoldenSpiral(scene, renderer, {
    turns: 6,
    height: 10,
    radius: 0.5,
    segments: 300
  });

   scene.userData.blockEmitter1 = new BlockEmitter(
    scene,
    physicsWorld,
    meshBodyMap,
    {
      vectorFunc: (t) => {
        const r = 2.0;
        const θ = t * 1.5;
        return { x: r * Math.cos(θ), y: 6, z: r * Math.sin(θ) };
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
        return { x: r * Math.cos(θ), y: 6, z: r * Math.sin(θ) };
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
    { origin: { x: 0, y: 6, z: 0 }, rate: 10, speed: 4, lifespan: 3 }
  );
  scene.userData.sphereEmitter2 = new SphereEmitter(
    scene,
    physicsWorld,
    meshBodyMap,
    { origin: { x: -5, y: 6, z: 0 }, rate: 10, speed: 4, lifespan: 3 }
  );
   scene.onBeforeRender = () => {
    const delta = clock.getDelta();
    scene.userData.blockEmitter1.update(delta);
    scene.userData.blockEmitter2.update(delta);
    scene.userData.sphereEmitter1.update(delta);
    scene.userData.sphereEmitter2.update(delta);
  };
  // サウンド読み込みとピアノ配置
  fetch('./assets/sounds/piano_note.wav')
    .then(res => res.arrayBuffer())
    .then(buf => audioContext.decodeAudioData(buf))
    .then(buffer => {
      audioBuffer = buffer;
      addPiano(scene, physicsWorld, meshBodyMap, audioContext, audioBuffer, playerBody);
    });
    const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(0, 5, 0); // 高いところに設置
    scene.add(sphereMesh);

    const sphereShape = new CANNON.Sphere(0.2);
    const sphereBody = new CANNON.Body({ mass: 1 });
    sphereBody.addShape(sphereShape);
    sphereBody.position.set(0, 5, 0);
    physicsWorld.addBody(sphereBody);

    meshBodyMap.set(sphereMesh, sphereBody);
}
}
