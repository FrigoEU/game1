
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import glb from "./Argon.glb";

type Model = {
  mesh: Mesh;
  assetContainer: AssetContainer;
  animations: {
    jump: AnimationGroup;
    mask: AnimationGroup;
    run: AnimationGroup;
    t_pose: AnimationGroup;
    walk: AnimationGroup;
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
    throw new Error("No mesh found when loading ./assets/Argon.glb.");
  }

  return {
    mesh: loaded.meshes[0] as Mesh,
    assetContainer: loaded,
    animations: {
      jump: loaded.animationGroups.find(ac => ac.name === "jump")!,
      mask: loaded.animationGroups.find(ac => ac.name === "mask")!,
      run: loaded.animationGroups.find(ac => ac.name === "run")!,
      t_pose: loaded.animationGroups.find(ac => ac.name === "t_pose")!,
      walk: loaded.animationGroups.find(ac => ac.name === "walk")!
    },
  };
}
