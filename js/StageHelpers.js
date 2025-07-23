import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/**
 * 3Dモデル (GLTF) を読み込みシーンに追加
 */
export function addModel(scene, url, position, scale) {
  const loader = new GLTFLoader();
  loader.load(url,
    gltf => {
      const model = gltf.scene;
      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      model.position.set(position.x, position.y, position.z);
      model.scale.set(scale.x, scale.y, scale.z);
      scene.add(model);
    },
    undefined,
    err => console.error('Model load error:', err)
  );
}

/**
 * 3Dモデル (FBX) を読み込みシーンに追加
 */
export function addFBXModel(scene, url, position, scale) {
  const loader = new FBXLoader();
  loader.load(url,
    object => {
      object.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      object.position.set(position.x, position.y, position.z);
      object.scale.set(scale.x, scale.y, scale.z);
      scene.add(object);
    },
    undefined,
    err => console.error('FBX load error:', err)
  );
}

/**
 * 立方体を追加
 */
export function addCube(scene, position, scale, color) {
  const geo = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
  const mat = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(position.x, position.y, position.z);
  mesh.castShadow = true;
  scene.add(mesh);
}

/**
 * 球体を追加
 */
export function addSphere(scene, position, radius, color) {
  const geo = new THREE.SphereGeometry(radius, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(position.x, position.y, position.z);
  mesh.castShadow = true;
  scene.add(mesh);
}

/**
 * 三角形を追加
 */
export function addTriangle(scene, position, color) {
  const geo = new THREE.BufferGeometry();
  const vertices = new Float32Array([0,1,0, -1,-1,0, 1,-1,0]);
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(position.x, position.y, position.z);
  mesh.castShadow = true;
  scene.add(mesh);
}

/**
 * CanvasTextureで浮かぶテキストを追加
 */
export function addFloatingText(scene, text, position, opts) {
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
  const geo = new THREE.PlaneGeometry(opts.size * 4, opts.size * 2);
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(position.x, position.y, position.z);
  scene.add(mesh);
}

/**
 * 半球光を追加
 */
export function addHemisphereLight(scene, skyColor, groundColor, intensity, position) {
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  light.position.set(position.x, position.y, position.z);
  scene.add(light);
}

/**
 * 指向性光を追加
 */
export function addDirectionalLight(scene, color, intensity, position) {
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(position.x, position.y, position.z);
  light.castShadow = true;
  scene.add(light);
}

/**
 * テクスチャ地面を追加
 */
export function addTexturedGround(scene, url, size, position, repeat) {
  const loader = new THREE.TextureLoader();
  const tex = loader.load(url);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat.x, repeat.y);
  const geo = new THREE.PlaneGeometry(size.width, size.height);
  const mat = new THREE.MeshStandardMaterial({ map: tex });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(position.x, position.y, position.z);
  mesh.receiveShadow = true;
  scene.add(mesh);
}
