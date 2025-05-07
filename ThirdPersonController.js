// ThirdPersonController.js
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class ThirdPersonController {
  /**
   * @param {THREE.Scene}   scene
   * @param {THREE.Camera}  camera
   * @param {string}        fbxUrl
   * @param {{position:{x,y,z}, scale:{x,y,z}, offset:{x,y,z}}} opts
   */
  constructor(scene, camera, fbxUrl, opts) {
    this.scene  = scene;
    this.camera = camera;
    this.opts   = opts;
    this.velocity  = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.move = { forward:false, backward:false, left:false, right:false };

    // Load FBX model
    const loader = new FBXLoader();
    loader.load(fbxUrl, object => {
      this.model = object;
      this.model.traverse(c => c.isMesh && (c.castShadow = c.receiveShadow = true));
      this.model.position.set(opts.position.x, opts.position.y, opts.position.z);
      this.model.scale.set(opts.scale.x, opts.scale.y, opts.scale.z);
      scene.add(this.model);
    });

    // キーイベント
    document.addEventListener('keydown', e => this._onKey(e, true));
    document.addEventListener('keyup',   e => this._onKey(e, false));
  }

  _onKey(e, down) {
    switch (e.code) {
      case 'KeyW': this.move.forward  = down; break;
      case 'KeyS': this.move.backward = down; break;
      case 'KeyA': this.move.left     = down; break;
      case 'KeyD': this.move.right    = down; break;
    }
  }

  update(delta) {
    if (!this.model) return;
    // 移動方向
    this.direction.set(
      (this.move.right  ? 1 : 0) - (this.move.left     ? 1 : 0),
      0,
      (this.move.backward? 1 : 0) - (this.move.forward  ? 1 : 0)
    );
    if (this.direction.length() > 0) {
      this.direction.normalize();
      // モデルの向きを移動方向に合わせる
      const angle = Math.atan2(this.direction.x, this.direction.z);
      this.model.rotation.y = angle;
    }

    // 速度
    const speed = 5;
    this.velocity.copy(this.direction).multiplyScalar(speed * delta);
    // 前後左右移動
    this.model.position.add(this.velocity);

    // カメラ追従
    const { x:ox,y:oy,z:oz } = this.opts.offset;
    const camPos = new THREE.Vector3().copy(this.model.position)
      .add(new THREE.Vector3(ox, oy, oz));
    this.camera.position.lerp(camPos, 0.1);               // なめらかに追従
    this.camera.lookAt(this.model.position);
  }
}
