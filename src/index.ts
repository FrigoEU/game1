import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import * as DWT from "./scenes/defaultWithTexture";
import * as LME from "./scenes/loadModelAndEnv";

const getModuleToLoad = (): string | undefined =>
  location.search.split("scene=")[1];

const routes: {
  [key: string]: (e: Engine, c: HTMLCanvasElement) => Promise<Scene>;
} = {
  defaultWithTexture: DWT.createScene,
  loadModelAndEnv: LME.createScene,
};

export const babylonInit = async (): Promise<void> => {
  // get the module to load
  const moduleName = getModuleToLoad();

  const createScene = moduleName
    ? routes[moduleName] || DWT.createScene
    : LME.createScene;

  // Get the canvas element
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  // Generate the BABYLON 3D engine
  const engine = new Engine(canvas, true);

  // Create the scene
  const scene = await createScene(engine, canvas);

  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
    scene.render();
  });

  // Watch for browser/canvas resize events
  window.addEventListener("resize", function () {
    engine.resize();
  });
};

babylonInit().then(() => {
  // scene started rendering, everything is initialized
});
