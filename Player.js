import * as THREE from 'three';

export class Player {
  constructor(controls, speed = 5.0) {
    this.controls = controls;
    this.speed = speed;
    this.move = { forward:false, backward:false, left:false, right:false };

    document.addEventListener('keydown', e => this._onKey(e, true));
    document.addEventListener('keyup',   e => this._onKey(e, false));
  }

  _onKey(e, isDown) {
    switch (e.code) {
      case 'KeyW': this.move.forward  = isDown; break;
      case 'KeyS': this.move.backward = isDown; break;
      case 'KeyA': this.move.left     = isDown; break;
      case 'KeyD': this.move.right    = isDown; break;
    }
  }

  update(delta) {
    if (!this.controls.isLocked) return;
    const dist = this.speed * delta;
    if (this.move.forward)  this.controls.moveForward(dist);
    if (this.move.backward) this.controls.moveForward(-dist);
    if (this.move.left)     this.controls.moveRight(-dist);
    if (this.move.right)    this.controls.moveRight(dist);
  }
}
