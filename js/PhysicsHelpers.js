import * as THREE from 'three';
import { Body, Box, Sphere, Vec3 } from 'cannon-es';

export function addCubeWithPhysics(scene, world, map, pos, scale, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(scale.x, scale.y, scale.z),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.castShadow = true;
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);

  const shape = new Box(new Vec3(scale.x/2, scale.y/2, scale.z/2));
  const body = new Body({ mass: 1, shape });
  body.position.set(pos.x, pos.y, pos.z);
  body.linearDamping = 0.4;
  body.angularDamping = 0.4;
  world.addBody(body);

  map.set(mesh, body);
}

export function addSphereWithPhysics(scene, world, map, pos, radius, color) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.castShadow = true;
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);

  const shape = new Sphere(radius);
  const body = new Body({ mass: 1, shape });
  body.position.set(pos.x, pos.y, pos.z);
  body.linearDamping = 0.4;
  body.angularDamping = 0.4;
  world.addBody(body);

  map.set(mesh, body);
}
