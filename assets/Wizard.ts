
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import glb from "./Wizard.glb";

type Model = {
  mesh: Mesh;
  assetContainer: AssetContainer;
  animations: {
    Death: AnimationGroup;
    Idle: AnimationGroup;
    Idle_Weapon: AnimationGroup;
    PickUp: AnimationGroup;
    Punch: AnimationGroup;
    RecieveHit: AnimationGroup;
    RecieveHit_Attacking: AnimationGroup;
    Run: AnimationGroup;
    Spell1: AnimationGroup;
    Staff_Attack: AnimationGroup;
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
    throw new Error("No mesh found when loading ./assets/Wizard.glb.");
  }

  return {
    mesh: loaded.meshes[0] as Mesh,
    assetContainer: loaded,
    animations: {
      Death: loaded.animationGroups.find(ac => ac.name === "Death")!,
      Idle: loaded.animationGroups.find(ac => ac.name === "Idle")!,
      Idle_Weapon: loaded.animationGroups.find(ac => ac.name === "Idle_Weapon")!,
      PickUp: loaded.animationGroups.find(ac => ac.name === "PickUp")!,
      Punch: loaded.animationGroups.find(ac => ac.name === "Punch")!,
      RecieveHit: loaded.animationGroups.find(ac => ac.name === "RecieveHit")!,
      RecieveHit_Attacking: loaded.animationGroups.find(ac => ac.name === "RecieveHit_Attacking")!,
      Run: loaded.animationGroups.find(ac => ac.name === "Run")!,
      Spell1: loaded.animationGroups.find(ac => ac.name === "Spell1")!,
      Staff_Attack: loaded.animationGroups.find(ac => ac.name === "Staff_Attack")!,
      Walk: loaded.animationGroups.find(ac => ac.name === "Walk")!
    },
  };
}
