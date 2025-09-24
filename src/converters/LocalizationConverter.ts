import { Odometry } from "../msgs/localization/Odometry";
import { VehicleInfo } from "../config/VehicleInfos";
import { vehicleInfoManager } from "../panels/VehicleInfoPanel";
import { SceneUpdate, CubePrimitive, SpherePrimitive } from "@foxglove/schemas";
import { MessageEvent, Immutable, PanelSettings } from "@lichtblick/suite";

const EgoColor = { r: 0.5, g: 0.5, b: 0.5, a: 0.7 }; // Gray

export interface LocalizationGUISettings {
  viewTrajectoryPoints: string;
  trajectoryFadeTime: number;
}

// Store trajectory point history data
const trajectoryHistory: Array<{
  position: { x: number; y: number; z: number };
  timestamp: { sec: number; nsec: number };
}> = [];

export const LocalizationSettings: Record<string, PanelSettings<unknown>> = {
  "3D": {
    settings: (config?: unknown) => ({
      fields: {
        viewTrajectoryPoints: {
          label: "View Trajectory Points",
          input: "toggle",
          value: (config as LocalizationGUISettings)?.viewTrajectoryPoints ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide vehicle trajectory points",
        },
        trajectoryFadeTime: {
          label: "Trajectory Fade Time (seconds)",
          input: "number",
          value: (config as LocalizationGUISettings)?.trajectoryFadeTime ?? 4,
          min: 1,
          max: 60,
          step: 1,
          help: "Time for trajectory points to disappear (seconds)",
        },
      },
    }),
    handler: () => {},
    defaultConfig: {
      viewTrajectoryPoints: "Off",
      trajectoryFadeTime: 4,
    } as LocalizationGUISettings,
  },
};

function getYawFromQuaternion(q: { x: number; y: number; z: number; w: number }): number {
  // yaw = atan2(2*(w*z + x*y), 1 - 2*(y*y + z*z))
  return Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z));
}

export function convertKinematicState(
  msg: Odometry,
  event: Immutable<MessageEvent<Odometry>>
): SceneUpdate {
  const guiSettings = event.topicConfig as LocalizationGUISettings;
  const vehicleInfo: VehicleInfo = vehicleInfoManager.getCurrentVehicle();
  const { header, pose } = msg;
  const { position, orientation } = pose.pose;

  const {
    wheel_base,
    wheel_tread,
    front_overhang,
    rear_overhang,
    left_overhang,
    right_overhang,
    vehicle_height,
  } = vehicleInfo;

  const vehicleLength = front_overhang + wheel_base + rear_overhang;
  const vehicleWidth = wheel_tread + left_overhang + right_overhang;
  const vehicleHeight = vehicle_height;

  const offsetX = vehicleLength / 2 - rear_overhang;
  const offsetY = 0;
  const offsetZ = vehicleHeight / 2;

  const yaw = getYawFromQuaternion(orientation);
  const cos_yaw = Math.cos(yaw);
  const sin_yaw = Math.sin(yaw);
  const vehicleCenterPosition = {
    x: position.x + offsetX * cos_yaw - offsetY * sin_yaw,
    y: position.y + offsetX * sin_yaw + offsetY * cos_yaw,
    z: position.z + offsetZ,
  };
  const EgoCube: CubePrimitive = {
    color: EgoColor,
    size: { x: vehicleLength, y: vehicleWidth, z: vehicleHeight },
    pose: {
      position: vehicleCenterPosition,
      orientation,
    },
  };

  const entities: SceneUpdate["entities"] = [
    {
      id: `ego_vehicle`,
      timestamp: header.stamp,
      frame_id: header.frame_id,
      frame_locked: false,
      lifetime: { sec: 1, nsec: 0 },
      metadata: [],
      arrows: [],
      cylinders: [],
      lines: [],
      spheres: [],
      texts: [],
      triangles: [],
      models: [],
      cubes: [EgoCube],
    },
  ];

  if (guiSettings?.viewTrajectoryPoints === "On") {
    // Add current position to trajectory history
    trajectoryHistory.push({
      position: position,
      timestamp: header.stamp,
    });

    const currentTime = header.stamp.sec + header.stamp.nsec / 1e9;
    const fadeTime = guiSettings?.trajectoryFadeTime ?? 4;
    
    // Remove expired and future points from history
    for (let i = trajectoryHistory.length - 1; i >= 0; i--) {
      const pointTime = trajectoryHistory[i]!.timestamp.sec + trajectoryHistory[i]!.timestamp.nsec / 1e9;
      if (currentTime - pointTime > fadeTime || pointTime > currentTime) {
        trajectoryHistory.splice(i, 1);
      }
    }

    // Create trajectory spheres with fixed color
    const trajectorySpheres: SpherePrimitive[] = trajectoryHistory.map((point) => {
      return {
        pose: {
          position: point.position,
          orientation: { x: 0, y: 0, z: 0, w: 1 },
        },
        size: { x: 0.1, y: 0.1, z: 0.1 },
        color: EgoColor,
      };
    });

    // Add trajectory spheres as separate entity to avoid color override
    if (trajectorySpheres.length > 0) {
      entities.push({
        id: `trajectory_points`,
        timestamp: header.stamp,
        frame_id: header.frame_id,
        frame_locked: false,
        lifetime: { sec: 1, nsec: 0 },
        metadata: [
          {
            key: "color_override",
            value: "false"
          }
        ],
        arrows: [],
        cylinders: [],
        lines: [],
        spheres: trajectorySpheres,
        texts: [],
        triangles: [],
        models: [],
        cubes: [],
      });
    }
  }

  return {
    deletions: [],
    entities,
  };
}
