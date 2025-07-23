// ===== Objects.js =====
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as CANNON from 'cannon-es';

/** GLTFモデル読み込み */
export function addModel(scene, url, position, scale, rotation = { x: 0, y: 0, z: 0 }, options = {}) {
  const loader = new GLTFLoader();

  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });

      model.position.set(position.x, position.y, position.z);
      model.scale.set(scale.x, scale.y, scale.z);
      model.rotation.set(rotation.x, rotation.y, rotation.z);

      scene.add(model);

      // 回転対象として登録
      if (options.autoRotateY) {
        if (!scene.userData.autoRotateTargets) {
          scene.userData.autoRotateTargets = [];
        }
        scene.userData.autoRotateTargets.push({ object: model, speed: options.autoRotateY });
      }
    },
    undefined,
    (err) => {
      console.error(`Failed to load ${url}`, err);
    }
  );
}

/** FBXモデル読み込み */
export function addFBXModel(scene, url, position, scale) {
  const loader = new FBXLoader(); // ✅ 正しいローダー
  loader.load(
    url,
    object => {
      object.position.set(position.x, position.y, position.z);
      object.scale.set(scale.x, scale.y, scale.z);
      scene.add(object);
    },
    undefined,
    error => {
      console.error('FBX load error:', error);
    }
  );
}

/** 立方体 */
export function addCube(scene, pos, scale, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(scale.x, scale.y, scale.z),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(pos.x, pos.y, pos.z);
  mesh.castShadow = true;
  scene.add(mesh);
}

/** 球体 */
export function addSphere(scene, pos, rad, color) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(rad, 32, 32),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(pos.x, pos.y, pos.z);
  mesh.castShadow = true;
  scene.add(mesh);
}

/** 三角形 */
export function addTriangle(scene, pos, color) {
  const geo = new THREE.BufferGeometry();
  const verts = new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]);
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide })
  );
  mesh.position.set(pos.x, pos.y, pos.z);
  mesh.castShadow = true;
  scene.add(mesh);
}

/** 浮かぶテキスト */
export function addFloatingText(scene, text, pos, opts) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = opts.color || 'white';
  ctx.font = `Bold ${opts.size * 64}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(opts.size * 4, opts.size * 2),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);
}

/** 吹き出し（四角） */
export function addSpeechBubble(scene, text, pos, opts = {}) {
  const size = opts.size || 1;
  const bg = opts.background || 'rgba(0,0,0,0.7)';
  const col = opts.color || 'white';
  const pad = opts.padding || 20;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(pad, pad, canvas.width - pad * 2, canvas.height - pad * 2);
  ctx.fillStyle = col;
  ctx.font = `Bold ${size * 40}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size * 4, size * 2),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);
}

/** 吹き出し（角丸） */
export function addRoundedSpeechBubble(scene, text, pos, opts = {}) {
  const size = opts.size || 1;
  const bg = opts.background || 'rgba(0,0,0,0.7)';
  const col = opts.color || 'white';
  const pad = opts.padding || 20;
  const radius = opts.cornerRadius || 30;
  const tailSize = opts.tailSize || 20;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  const x = pad, y = pad;
  const w = canvas.width - pad * 2;
  const h = canvas.height - pad * 2 - tailSize;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  const tx = x + w / 2, ty = y + h;
  ctx.moveTo(tx - tailSize / 2, ty);
  ctx.lineTo(tx, ty + tailSize);
  ctx.lineTo(tx + tailSize / 2, ty);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = col;
  ctx.font = `Bold ${size * 40}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, (canvas.height - tailSize) / 2);
  const texture = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size * 4, size * 2 + (tailSize / 128) * size),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);
}

/** テクスチャ地面 */
export function addTexturedGround(scene, url, size, pos, repeat) {
  const loader = new THREE.TextureLoader();
  const tex = loader.load(url);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat.x, repeat.y);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size.width, size.height),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 1.0, metalness: 0.0 })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(pos.x, pos.y, pos.z);
  mesh.receiveShadow = true;
  scene.add(mesh);
}

/** 半球光 */
export function addHemisphereLight(scene, skyColor, groundColor, intensity, position) {
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  light.position.set(position.x, position.y, position.z);
  scene.add(light);
}

/** 平行光 */
export function addDirectionalLight(scene, color, intensity, position) {
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(position.x, position.y, position.z);
  light.castShadow = true;
  scene.add(light);
}

/** ランダムRGBのボールを噴き出す Emitter */
export class SphereEmitter {
  constructor(scene, world, map, options = {}) {
    this.scene = scene;
    this.world = world;
    this.map = map;
    this.origin = options.origin || { x: 0, y: 1, z: 0 };
    this.rate = options.rate || 0.25; // 生成レート
    this.speed = options.speed || 5;
    this.lifespan = options.lifespan || 3;
    this.accumulator = 0;
    this.particles = [];
  }

  update(delta) {
    this.accumulator += delta * this.rate;
    while (this.accumulator >= 1) {
      this._spawnSphere();
      this.accumulator -= 1;
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += delta;
      if (p.age >= this.lifespan) {
        this.scene.remove(p.mesh);
        this.world.removeBody(p.body);
        this.map.delete(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  _spawnSphere() {
    const radius = 0.5;
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const colorHex = (r << 16) | (g << 8) | b;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 24, 24),
      new THREE.MeshStandardMaterial({ color: colorHex })
    );
    mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    mesh.castShadow = true;
    this.scene.add(mesh);
    const body = new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(radius) });
    body.position.set(this.origin.x, this.origin.y, this.origin.z);
    const dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 0.5,
      Math.random() * 2 - 1
    )
      .normalize()
      .multiplyScalar(this.speed);
    body.velocity.set(dir.x, dir.y, dir.z);
    this.world.addBody(body);
    this.map.set(mesh, body);
    this.particles.push({ mesh, body, age: 0 });
  }
}
/** 黄金色で渦巻き線上に上へ伸びるオブジェクトを追加 */
export function addGoldenSpiral(scene, renderer, options = {}) {
  const {
    turns = 5,
    height = 10,
    radius = 2,
    segments = 200,
    startY = 0,
    origin = { x: 0, y: 0, z: 0 }  // ← 追加
  } = options;

  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2 * turns;
    const r = radius * Math.exp(0.15 * t);
    const x = r * Math.cos(t) + origin.x;
    const y = startY + (height * (i / segments)) + origin.y;
    const z = r * Math.sin(t) + origin.z;
    points.push(new THREE.Vector3(x, y, z));
  }

  const path = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(path, segments, 0.1, 8, false);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffd700,
    metalness: 1,
    roughness: 0.2,
    emissive: new THREE.Color(0x111100),
    clearcoat: 1,
    reflectivity: 1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  scene.add(mesh);
}
// Objects.js に追加
export function addPiano(scene, world, meshBodyMap) {
  const geometry = new THREE.BoxGeometry(2, 0.2, 2);
  const material = new THREE.MeshStandardMaterial({ color: 0x999999 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0.1, 0);
  mesh.userData.isPianoKey = true;
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(1, 0.1, 1));
  const body = new CANNON.Body({ mass: 0 });
  body.addShape(shape);
  body.position.copy(mesh.position);
  world.addBody(body);

  meshBodyMap.set(mesh, body);
}

export function addPianoKey(scene, physicsWorld, meshBodyMap, pos, noteBuffer) {
  const geometry = new THREE.BoxGeometry(1, 0.2, 2);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.1, 1));
  const body = new CANNON.Body({ mass: 0, shape });
  body.position.set(pos.x, pos.y, pos.z);
  physicsWorld.addBody(body);

  meshBodyMap.set(mesh, body);

  // 衝突時に音を鳴らすようフラグを追加
  body.noteBuffer = noteBuffer;
  body.playedRecently = false;

  return body;
}
/** 物理演算ブロック Emitter */
export class BlockEmitter {
  constructor(scene, world, map, options = {}) {
    this.scene = scene;
    this.world = world;
    this.map = map;
    this.origin = options.origin || { x: 0, y: 1, z: 0 };
    this.vectorFunc = options.vectorFunc || null;
    this.rate = options.rate || 0.25;// 生成レート
    this.speed = options.speed || 5;
    this.lifespan = options.lifespan || 3;
    this.accumulator = 0;
    this.particles = [];
    this.totalTime = 0;

    // 永続的な赤いブロック
    const redMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    redMesh.position.set(this.origin.x + 2, this.origin.y + 0.5, this.origin.z);
    redMesh.castShadow = true;
    scene.add(redMesh);
    const redBody = new CANNON.Body({ mass: 1, shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)) });
    redBody.position.copy(redMesh.position);
    world.addBody(redBody);
    map.set(redMesh, redBody);

    // 永続的な青い球
    const blueMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x0000ff })
    );
    blueMesh.position.set(this.origin.x - 2, this.origin.y + 0.7, this.origin.z);
    blueMesh.castShadow = true;
    scene.add(blueMesh);
    const blueBody = new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(0.7) });
    blueBody.position.copy(blueMesh.position);
    world.addBody(blueBody);
    map.set(blueMesh, blueBody);
  }

  update(delta) {
    this.totalTime += delta;
    this.accumulator += delta * this.rate;
    while (this.accumulator >= 1) {
      this._spawnBlock();
      this.accumulator -= 1;
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += delta;
      if (p.age >= this.lifespan) {
        this.scene.remove(p.mesh);
        this.world.removeBody(p.body);
        this.map.delete(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  _spawnBlock() {
    const size = 0.5;
    const pos = this.vectorFunc
      ? this.vectorFunc(this.totalTime, this.particles.length)
      : this.origin;
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const colorHex = (r << 16) | (g << 8) | b;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshStandardMaterial({ color: colorHex })
    );
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.castShadow = true;
    this.scene.add(mesh);
    const body = new CANNON.Body({ mass: 1, shape: new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2)) });
    body.position.set(pos.x, pos.y, pos.z);
    const dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 0.5,
      Math.random() * 2 - 1
    )
      .normalize()
      .multiplyScalar(this.speed);
    body.velocity.set(dir.x, dir.y, dir.z);
    this.world.addBody(body);
    this.map.set(mesh, body);
    this.particles.push({ mesh, body, age: 0 });
  }
}

export function rotateObjectY(object, delta, speed = 1.0) {
  object.rotation.y += speed * delta;
}