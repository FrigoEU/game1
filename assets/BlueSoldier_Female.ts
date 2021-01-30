
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import glb from "./BlueSoldier_Female.glb";

type Model = {
  mesh: Mesh;
  assetContainer: AssetContainer;
  animations: {
    Idle: AnimationGroup;
    PickUp: AnimationGroup;
    Punch: AnimationGroup;
    RecieveHit: AnimationGroup;
    Run: AnimationGroup;
    SitDown: AnimationGroup;
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
    throw new Error("No mesh found when loading ./assets/BlueSoldier_Female.glb.");
  }

  return {
    mesh: loaded.meshes[0] as Mesh,
    assetContainer: loaded,
    animations: {
      Idle: loaded.animationGroups.find(ac => ac.name === "Idle")!,
      PickUp: loaded.animationGroups.find(ac => ac.name === "PickUp")!,
      Punch: loaded.animationGroups.find(ac => ac.name === "Punch")!,
      RecieveHit: loaded.animationGroups.find(ac => ac.name === "RecieveHit")!,
      Run: loaded.animationGroups.find(ac => ac.name === "Run")!,
      SitDown: loaded.animationGroups.find(ac => ac.name === "SitDown")!,
      Walk: loaded.animationGroups.find(ac => ac.name === "Walk")!
    },
  };
}
