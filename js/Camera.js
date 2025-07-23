import { PerspectiveCamera } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function createCamera() {
  const cam = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  cam.position.set(0, 2, 5);
  return cam;
}

export function createControls(camera, domElement, overlay) {
  const controls = new PointerLockControls(camera, domElement);
  overlay.addEventListener('click', () => {
    // AudioContext を resume する（初回ユーザー操作で有効化）
    if (window.audioContext && window.audioContext.state === 'suspended') {
      window.audioContext.resume().then(() => {
        console.log('AudioContext resumed');
      });
    }

    controls.lock();
  });
  controls.addEventListener('lock', () => overlay.style.display = 'none');
  controls.addEventListener('unlock', () => overlay.style.display = 'flex');
  return controls;
}
