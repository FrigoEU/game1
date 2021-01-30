
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import glb from "./dog.glb";

type Model = {
  mesh: Mesh;
  assetContainer: AssetContainer;
  animations: {
    Walk: AnimationGroup;
  }
}

export async function load(scene: Scene): Promise<Model> {
  const loaded = await SceneLoader.LoadAssetContainerAsync(
    "",
    glb,
    scene,
    null,
    ".glb"
  );

  if (!loaded.meshes[0]) {
    throw new Error("No mesh found when loading ./assets/dog.glb.");
  }

  return {
    mesh: loaded.meshes[0] as Mesh,
    assetContainer: loaded,
    animations: {
      Walk: loaded.animationGroups.find(ac => ac.name === "Walk")!
    },
  };
}
