import * as THREE from 'three';
import { addHemisphereLight, addDirectionalLight, addTexturedGround, addModel, addCube, addFloatingText } from '../StageHelpers.js';

export function loadStage2(scene) {
  // サンプルステージ
  addHemisphereLight(scene, 0xffe0bd, 0x223322, 0.8, { x:0, y:50, z:0 });
  addDirectionalLight(scene, 0xffee88, 0.6, { x:-10, y:15, z:5 });
  addTexturedGround(scene, './assets/textures/stone.jpg', { width:50, height:50 }, { x:0, y:0, z:0 }, { x:10, y:10 });
  addModel(scene, './assets/models/optimus.glb', { x:-3, y:0, z:0 }, { x:0.8, y:0.8, z:0.8 });
  addCube(scene, { x:0, y:0.5, z:3 }, { x:2, y:2, z:2 }, 0x00ffff);
  addFloatingText(scene, 'サンプルステージ', { x:0, y:3, z:0 }, { size:1.5, height:0.1, color:'#ff00ff' });
}