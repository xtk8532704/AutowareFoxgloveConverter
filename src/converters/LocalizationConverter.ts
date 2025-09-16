import { Odometry } from "../msgs/localization/Odometry";
import { VehicleInfo } from "../config/VehicleInfos";
import { vehicleInfoManager } from "../panels/VehicleInfoPanel";
import { SceneUpdate, CubePrimitive } from "@foxglove/schemas";
import { MessageEvent, Immutable, PanelSettings } from "@lichtblick/suite";

const EgoColor = { r: 0.5, g: 0.5, b: 0.5, a: 0.7 }; // Gray

export const VehicleInfoSettings: Record<string, PanelSettings<unknown>> = {
  "3D": {
    settings: () => ({
      fields: {}
    }),
    handler: () => {},
    defaultConfig: {}
  }
};

function getYawFromQuaternion(q: { x: number; y: number; z: number; w: number }): number {
    // yaw = atan2(2*(w*z + x*y), 1 - 2*(y*y + z*z))
    return Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z));
}

export function convertKinematicState(msg: Odometry, _event: Immutable<MessageEvent<Odometry>>): SceneUpdate
{
    const vehicleInfo: VehicleInfo = vehicleInfoManager.getCurrentVehicle();
    const { header, pose } = msg;
    const { position, orientation } = pose.pose;

    const { wheel_base, wheel_tread, front_overhang, rear_overhang, left_overhang, right_overhang, vehicle_height } = vehicleInfo;

    const vehicleLength = front_overhang + 
                         wheel_base + 
                         rear_overhang;
    const vehicleWidth = wheel_tread + 
                        left_overhang + 
                        right_overhang;
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
    return {
        deletions: [],
        entities: [
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
        ],
    };
}

