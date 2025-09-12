import { ExtensionContext } from "@lichtblick/suite";

// Converters
import {
  convertDetectedObjects,
  convertTrackedObjects,
  convertPredictedObjects,
} from "./converters/PerceptionConverter";

import { convertKinematicState, VehicleInfoSettings } from "./converters/LocalizationConverter";

// Panels
import { initDLRDiagnosticsResultPanel } from "./panels/DLRDiagnosticsPanel";


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

  // Localization Converters
  extensionContext.registerMessageConverter({
    fromSchemaName: "nav_msgs/msg/Odometry",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertKinematicState,
    panelSettings: VehicleInfoSettings
  });

  extensionContext.registerPanel({
    name: "DLR Diagnostics Result",
    initPanel: initDLRDiagnosticsResultPanel,
  });
}
