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

// debugger
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";

// digital assets
import controllerModel from "../../assets/glb/samsung-controller.glb";
import roomEnvironment from "../../assets/environment/room.env";
// import soldierModel from "../../assets/soldier.obj";
// import dogModel from "../../assets/dog.glb";
// import argonModel from "../../assets/Argon.glb";
import rangerM from "../../assets/Ranger.glb";
// import wizardM from "../../assets/Wizard.glb";
// import warriorM from "../../assets/Warrior.glb";
// import monkM from "../../assets/Monk.glb";
// import clericM from "../../assets/Cleric.glb";
import rogueM from "../../assets/Rogue.glb";
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

  function findAnimation(ac: AssetContainer, name: string): AnimationGroup {
    const nameLc = name.toLowerCase();
    const res = ac.animationGroups.find(
      (ac) => ac.name.toLowerCase() === nameLc
    );
    if (res) {
      return res;
    } else {
      const acname = ac.meshes[0]?.name;
      throw new Error(`Animation ${name} not found in asset ${acname}`);
    }
  }

  async function loadRanger(scene: Scene): Promise<Ranger> {
    const loaded = await SceneLoader.LoadAssetContainerAsync(
      "",
      rangerM,
      scene,
      null,
      ".glb"
    );

    if (!loaded.meshes[0]) {
      throw new Error(`No mesh found when loading ${rangerM}`);
    }

    // TODO: generate this from .glb file!
    return {
      mesh: loaded.meshes[0] as Mesh,
      assetContainer: loaded,
      animations: {
        walk: findAnimation(loaded, "walk"),
        run: findAnimation(loaded, "run"),
        punch: findAnimation(loaded, "punch"),
        recieveHit: findAnimation(loaded, "recieveHit"),
        attackRanged: findAnimation(loaded, "bow_attack_draw"),
      },
    };
  }

  async function loadRogue(scene: Scene): Promise<Rogue> {
    const loaded = await SceneLoader.LoadAssetContainerAsync(
      "",
      rogueM,
      scene,
      null,
      ".glb"
    );

    if (!loaded.meshes[0]) {
      throw new Error(`No mesh found when loading ${rogueM}`);
    }

    // TODO: generate this from .glb file!
    return {
      mesh: loaded.meshes[0] as Mesh,
      assetContainer: loaded,
      animations: {
        walk: findAnimation(loaded, "walk"),
        run: findAnimation(loaded, "run"),
        punch: findAnimation(loaded, "punch"),
        recieveHit: findAnimation(loaded, "recieveHit"),
        attackMelee: findAnimation(loaded, "dagger_attack"),
      },
    };
  }

  const ranger = await loadRanger(scene);
  ranger.assetContainer.addAllToScene();

  (window as any).ranger = ranger;

  ranger.mesh.position.x = -3;

  ranger.animations.walk.start(true);

  const rogue = await loadRogue(scene);
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

  rogue.animations.walk.start(true);

  return scene;
}
