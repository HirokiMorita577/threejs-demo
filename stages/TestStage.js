import * as THREE from 'three';
import { addHemisphereLight, addDirectionalLight, addTexturedGround, addModel, addCube, addSphere, addTriangle, addFloatingText } from '../StageHelpers.js';

export function loadTestStage(scene) {
  // テスト用ステージ
  addHemisphereLight(scene, 0x888888, 0x333333, 1, { x:0, y:50, z:0 });
  addIntervalGround(scene, './assets/textures/testground.jpg', { width:50, height:50 }, { x:0, y:0, z:0 }, { x:5, y:5 });
  addCube(scene, { x:0, y:0.5, z:0 }, { x:1, y:1, z:1 }, 0xffff00);
  addFloatingText(scene, 'Test', { x:0, y:2, z:0 }, { size:1, height:0.1, color:'white' });
}
