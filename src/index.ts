import { ExtensionContext } from "@lichtblick/suite";

import {
  convertDetectedObjects,
  convertTrackedObjects,
  convertPredictedObjects,
} from "./converters/PerceptionConverter";

import { convertKinematicState } from "./converters/LocalizationConverter";

import { initVehicleConfigPanel } from "./VehicleConfigPanel";


export function activate(extensionContext: ExtensionContext): void {
  // Perception Converters
  extensionContext.registerMessageConverter({
    fromSchemaName: "autoware_auto_perception_msgs/msg/PredictedObjects",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertPredictedObjects,
  });
  extensionContext.registerMessageConverter({
    fromSchemaName: "autoware_perception_msgs/msg/PredictedObjects",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertPredictedObjects,
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "autoware_auto_perception_msgs/msg/TrackedObjects",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertTrackedObjects,
  });
  extensionContext.registerMessageConverter({
    fromSchemaName: "autoware_perception_msgs/msg/TrackedObjects",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertTrackedObjects,
  });
  extensionContext.registerMessageConverter({
    fromSchemaName: "autoware_auto_perception_msgs/msg/DetectedObjects",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertDetectedObjects,
  });
  extensionContext.registerMessageConverter({
    fromSchemaName: "autoware_perception_msgs/msg/DetectedObjects",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertDetectedObjects,
  });

  // Planning Converters

  // Localization Converters
  extensionContext.registerMessageConverter({
    fromSchemaName: "nav_msgs/msg/Odometry",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertKinematicState,
  });



  // Vehicle Select Panel
  extensionContext.registerPanel({
    name: "Vehicle Config",
    initPanel: initVehicleConfigPanel,
  });
}
