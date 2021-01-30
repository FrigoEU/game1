import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { EnvironmentHelper } from "@babylonjs/core/Helpers/environmentHelper";

// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import "@babylonjs/loaders/OBJ";

import * as Ranger from "../../assets/Ranger";
import * as Rogue from "../../assets/Rogue";

// debugger
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";

// digital assets
import controllerModel from "../../assets/glb/samsung-controller.glb";
import roomEnvironment from "../../assets/environment/room.env";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { Angle } from "@babylonjs/core/Maths/math";

interface HumanAnimations {
  walk: AnimationGroup;
  run: AnimationGroup;
  punch: AnimationGroup;
  recieveHit: AnimationGroup;
}

interface Human {
  mesh: Mesh;
  assetContainer: AssetContainer;
  animations: HumanAnimations;
}
interface Ranger extends Human {
  animations: HumanAnimations & {
    attackRanged: AnimationGroup;
  };
}
interface Rogue extends Human {
  animations: HumanAnimations & {
    attackMelee: AnimationGroup;
  };
}

const enum Direction {
  North,
  East,
  South,
  West,
}

/*
  level layout
  = n x m matrix.
  North = on screen most to right and up
  Farthest south-west = 0, 0
  Farthest north-east = maxX, maxY

*/

type level = {
  maxX: number; // > 0
  maxY: number; // > 0
  teams: {
    characters: {
      id: number;
      location: [number, number];
      facing: Direction;
    };
  }[];
  obstacles: {
    type: void;
    location: [number, number];
    facing: Direction;
  }[];
};

type characterMap = {
  [id: number]: Human;
};

type movement = {
  characterId: number;
  from: [number, number];
  to: [number, number];
  via: [number, number][] | null;
};

const queuedActions: movement[] = [];

export async function createScene(
  engine: Engine,
  canvas: HTMLCanvasElement
): Promise<Scene> {
  // This creates a basic Babylon Scene object (non-mesh)
  const scene = new Scene(engine);

  // This creates and positions a free camera (non-mesh)
  const camera = new ArcRotateCamera(
    "my first camera",
    0,
    Math.PI / 3,
    10,
    new Vector3(0, 0, 0),
    scene
  );

  // This targets the camera to scene origin
  camera.setTarget(Vector3.Zero());

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  camera.useFramingBehavior = true;

  // load the environment file
  // scene.environmentTexture = new CubeTexture(roomEnvironment, scene);

  // if not setting the envtext of the scene, we have to load the DDS module as well
  // new EnvironmentHelper(
  //   {
  //     skyboxTexture: roomEnvironment,
  //     createGround: false,
  //   },
  //   scene
  // );

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  // const importR = await SceneLoader.ImportMeshAsync(
  //   "",
  //   "",
  //   soldierModel,
  //   scene,
  //   undefined,
  //   ".obj"
  // );

  // console.table(importR);

  // // just scale it so we can see it better
  // importR.meshes[0].scaling.scaleInPlace(10);

  const ranger = await Ranger.load(scene);
  ranger.assetContainer.addAllToScene();

  (window as any).ranger = ranger;

  ranger.mesh.position.x = -3;

  ranger.animations.Walk.start(true);

  const rogue = await Rogue.load(scene);
  rogue.assetContainer.addAllToScene();

  rogue.mesh.position.x = 3;

  // ranger.mesh.addRotation(0, Angle.FromDegrees(90).radians(), 0);
  // rogue.mesh.addRotation(0, Angle.FromDegrees(-90).radians(), 0);

  ranger.mesh.rotationQuaternion = null;
  rogue.mesh.rotationQuaternion = null;

  ranger.mesh.rotation.set(0, Angle.FromDegrees(-90).radians(), 0);
  rogue.mesh.rotation.set(0, Angle.FromDegrees(90).radians(), 0);

  (window as any).rogue = rogue;
  (window as any).Vector3 = Vector3;
  (window as any).Angle = Angle;

  rogue.animations.Walk.start(true);

  return scene;
}
