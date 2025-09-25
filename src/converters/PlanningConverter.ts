import { Path } from "../msgs/planning/Path";
import { PathWithLaneId } from "../msgs/planning/PathWithLaneId";
import { Trajectory } from "../msgs/planning/Trajectory";
import {
  SceneUpdate,
  LinePrimitive,
  TextPrimitive,
  TriangleListPrimitive,
  ArrowPrimitive,
} from "@foxglove/schemas";
import { MessageEvent, Immutable, PanelSettings } from "@lichtblick/suite";
import { VehicleInfo } from "../config/VehicleInfos";
import { vehicleInfoManager } from "../panels/VehicleInfoPanel";
import { PlanningConfig, getPlanningConfig, Color, BASE_Z_HEIGHT } from "../config/Planning";

interface PlanningGUISettings {
  viewPath: string;
  viewVelocity: string;
  viewVelocityText: string;
  viewFootprint: string;
  viewPoint: string;
  viewDrivableArea: string;
  viewTimeText: string;
}

function createSimplifiedPlanningSettings(
  messageType: "Path" | "PathWithLaneId" | "Trajectory"
): Record<string, PanelSettings<unknown>> {
  return {
    "3D": {
      settings: (config?: unknown) => ({
        fields: {
          viewPath: {
            label: "View Path",
            input: "toggle",
            value: (config as PlanningGUISettings)?.viewPath ?? "On",
            options: ["Off", "On"],
            help: "Show/hide the path visualization",
          },
          viewVelocity: {
            label: "View Velocity",
            input: "toggle",
            value: (config as PlanningGUISettings)?.viewVelocity ?? "Off",
            options: ["Off", "On"],
            help: "Show/hide velocity arrows",
          },
          viewVelocityText: {
            label: "View Text Velocity",
            input: "toggle",
            value: (config as PlanningGUISettings)?.viewVelocityText ?? "Off",
            options: ["Off", "On"],
            help: "Show/hide velocity text",
          },
          viewFootprint: {
            label: "View Footprint",
            input: "toggle",
            value: (config as PlanningGUISettings)?.viewFootprint ?? "Off",
            options: ["Off", "On"],
            help: "Show/hide vehicle footprint",
          },
          viewPoint: {
            label: "View Point",
            input: "toggle",
            value: (config as PlanningGUISettings)?.viewPoint ?? "Off",
            options: ["Off", "On"],
            help: "Show/hide path points",
          },
          ...(messageType === "Path" || messageType === "PathWithLaneId"
            ? {
                viewDrivableArea: {
                  label: "View Drivable Area",
                  input: "toggle",
                  value: (config as PlanningGUISettings)?.viewDrivableArea ?? "Off",
                  options: ["Off", "On"],
                  help: "Show/hide drivable area boundaries",
                },
              }
            : {}),
          ...(messageType === "Trajectory"
            ? {
                viewTimeText: {
                  label: "View Time Text",
                  input: "toggle",
                  value: (config as PlanningGUISettings)?.viewTimeText ?? "Off",
                  options: ["Off", "On"],
                  help: "Show/hide time text",
                },
              }
            : {}),
        },
      }),
      handler: (_action: any, _config: any) => {
        // Settings updated
      },
      defaultConfig: {
        viewPath: "On",
        viewVelocity: "Off",
        viewVelocityText: "Off",
        viewFootprint: "Off",
        viewPoint: "Off",
        viewDrivableArea: "Off",
        viewTimeText: "Off",
      } as PlanningGUISettings,
    },
  };
}

function setColorDependsOnVelocity(
  velocity: number,
  velMax: number,
  minColor: Color,
  midColor: Color,
  maxColor: Color
): Color {
  // Match rviz implementation: simple linear interpolation based on velocity ratio
  const ratio = Math.min(Math.max(velocity / velMax, 0.0), 1.0);

  if (ratio < 0.5) {
    // Interpolate between min and mid colors
    const localRatio = ratio * 2.0;
    return {
      r: midColor.r * localRatio + minColor.r * (1.0 - localRatio),
      g: midColor.g * localRatio + minColor.g * (1.0 - localRatio),
      b: midColor.b * localRatio + minColor.b * (1.0 - localRatio),
      a: 1.0,
    };
  } else {
    // Interpolate between mid and max colors
    const localRatio = (ratio - 0.5) * 2.0;
    return {
      r: maxColor.r * localRatio + midColor.r * (1.0 - localRatio),
      g: maxColor.g * localRatio + midColor.g * (1.0 - localRatio),
      b: maxColor.b * localRatio + midColor.b * (1.0 - localRatio),
      a: 1.0,
    };
  }
}

function getYawFromQuaternion(q: { x: number; y: number; z: number; w: number }): number {
  return Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z));
}

function calculateDistance(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function mergeConfigWithGUISettings(
  messageType: "Path" | "PathWithLaneId" | "Trajectory",
  guiSettings?: PlanningGUISettings
): PlanningConfig {
  const baseConfig = getPlanningConfig(messageType);

  if (!guiSettings) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    viewPath: guiSettings.viewPath,
    viewVelocity: guiSettings.viewVelocity,
    viewVelocityText: guiSettings.viewVelocityText,
    viewFootprint: guiSettings.viewFootprint,
    viewPoint: guiSettings.viewPoint,
    viewDrivableArea: guiSettings.viewDrivableArea,
    viewTimeText: guiSettings.viewTimeText,
  };
}

export function convertPlanningMessage<T extends Path | PathWithLaneId | Trajectory>(
  msg: T,
  event: Immutable<MessageEvent<T>>,
  messageType: "Path" | "PathWithLaneId" | "Trajectory"
): SceneUpdate {
  const guiSettings = event.topicConfig as PlanningGUISettings;
  const config = mergeConfigWithGUISettings(messageType, guiSettings);
  const vehicleInfo: VehicleInfo = vehicleInfoManager.getCurrentVehicle();

  const entities: SceneUpdate["entities"] = [];

  if (msg.points.length === 0) {
    return {
      deletions: [],
      entities: [],
    };
  }

  const alphas = new Array(msg.points.length).fill(config.pathAlpha);
  if (config.fadeOutDistance > 0) {
    alphas[alphas.length - 1] = 0.0;
    let cumulativeDistance = 0.0;

    for (let pointIdx = msg.points.length - 1; pointIdx > 0; pointIdx--) {
      const currPoint = msg.points[pointIdx]!;
      const prevPoint = msg.points[pointIdx - 1]!;

      const currPose = "point" in currPoint ? currPoint.point.pose : currPoint.pose;
      const prevPose = "point" in prevPoint ? prevPoint.point.pose : prevPoint.pose;

      const distance = calculateDistance(prevPose.position, currPose.position);
      cumulativeDistance += distance;

      if (cumulativeDistance <= config.fadeOutDistance) {
        const ratio = cumulativeDistance / config.fadeOutDistance;
        alphas[pointIdx - 1] = config.pathAlpha * ratio;
      } else {
        break;
      }
    }
  }

  if (config.viewPath === "On") {
    const alphas: number[] = [];

    if (config.fadeOutDistance > 0.0) {
      let distanceFromEnd = 0.0;
      for (let i = msg.points.length - 1; i > 0; i--) {
        const currentPoint = msg.points[i]!;
        const prevPoint = msg.points[i - 1]!;
        const currentPose = "point" in currentPoint ? currentPoint.point.pose : currentPoint.pose;
        const prevPose = "point" in prevPoint ? prevPoint.point.pose : prevPoint.pose;

        distanceFromEnd += calculateDistance(
          { x: currentPose.position.x, y: currentPose.position.y, z: currentPose.position.z },
          { x: prevPose.position.x, y: prevPose.position.y, z: prevPose.position.z }
        );

        if (distanceFromEnd < config.fadeOutDistance) {
          const ratio = distanceFromEnd / config.fadeOutDistance;
          alphas[i] = config.pathAlpha * ratio;
        } else {
          alphas[i] = config.pathAlpha;
        }
      }
      alphas[0] = config.pathAlpha;
    } else {
      alphas.fill(config.pathAlpha, 0, msg.points.length);
    }

    const vertices: { x: number; y: number; z: number }[] = [];
    const colors: Color[] = [];
    const indices: number[] = [];

    for (let pointIdx = 0; pointIdx < msg.points.length; pointIdx++) {
      const point = msg.points[pointIdx]!;
      const pose = "point" in point ? point.point.pose : point.pose;
      const velocity =
        "point" in point ? point.point.longitudinal_velocity_mps : point.longitudinal_velocity_mps;

      const baseColor = setColorDependsOnVelocity(
        velocity,
        config.colorBorderVelMax,
        config.minVelocityColor,
        config.midVelocityColor,
        config.maxVelocityColor
      );
      const color = { ...baseColor, a: alphas[pointIdx] || config.pathAlpha };

      const pathWidth = config.pathWidth;
      const halfWidth = pathWidth / 2.0;

      const q = pose.orientation;
      const qw = q.w;
      const qx = q.x;
      const qy = q.y;
      const qz = q.z;

      const rightLocal = { x: 0, y: halfWidth, z: 0 };
      const rightGlobal = {
        x:
          rightLocal.x * (1 - 2 * qy * qy - 2 * qz * qz) +
          rightLocal.y * (2 * qx * qy - 2 * qw * qz) +
          rightLocal.z * (2 * qx * qz + 2 * qw * qy),
        y:
          rightLocal.x * (2 * qx * qy + 2 * qw * qz) +
          rightLocal.y * (1 - 2 * qx * qx - 2 * qz * qz) +
          rightLocal.z * (2 * qy * qz - 2 * qw * qx),
        z:
          rightLocal.x * (2 * qx * qz - 2 * qw * qy) +
          rightLocal.y * (2 * qy * qz + 2 * qw * qx) +
          rightLocal.z * (1 - 2 * qx * qx - 2 * qy * qy),
      };

      vertices.push({
        x: pose.position.x + rightGlobal.x,
        y: pose.position.y + rightGlobal.y,
        z: pose.position.z + rightGlobal.z + BASE_Z_HEIGHT,
      });
      colors.push(color);

      const leftLocal = { x: 0, y: -halfWidth, z: 0 };
      const leftGlobal = {
        x:
          leftLocal.x * (1 - 2 * qy * qy - 2 * qz * qz) +
          leftLocal.y * (2 * qx * qy - 2 * qw * qz) +
          leftLocal.z * (2 * qx * qz + 2 * qw * qy),
        y:
          leftLocal.x * (2 * qx * qy + 2 * qw * qz) +
          leftLocal.y * (1 - 2 * qx * qx - 2 * qz * qz) +
          leftLocal.z * (2 * qy * qz - 2 * qw * qx),
        z:
          leftLocal.x * (2 * qx * qz - 2 * qw * qy) +
          leftLocal.y * (2 * qy * qz + 2 * qw * qx) +
          leftLocal.z * (1 - 2 * qx * qx - 2 * qy * qy),
      };

      vertices.push({
        x: pose.position.x + leftGlobal.x,
        y: pose.position.y + leftGlobal.y,
        z: pose.position.z + leftGlobal.z + BASE_Z_HEIGHT,
      });
      colors.push(color);
    }

    for (let i = 0; i < vertices.length - 2; i += 2) {
      indices.push(i, i + 1, i + 2);
      indices.push(i + 1, i + 2, i + 3);
    }

    if (vertices.length > 0) {
      const pathTriangle: TriangleListPrimitive = {
        pose: {
          position: { x: 0, y: 0, z: 0 },
          orientation: { x: 0, y: 0, z: 0, w: 1 },
        },
        color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
        points: vertices,
        colors: colors,
        indices: indices,
      };

      entities.push({
        id: `path_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 0, nsec: 200000000 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: [],
        spheres: [],
        texts: [],
        triangles: [pathTriangle],
        models: [],
        cubes: [],
      });
    }
  }

  if (config.viewVelocity === "On") {
    const velocityArrows: ArrowPrimitive[] = [];

    for (const point of msg.points) {
      const pose = "point" in point ? point.point.pose : point.pose;
      const velocity =
        "point" in point ? point.point.longitudinal_velocity_mps : point.longitudinal_velocity_mps;

      let color: Color;
      if (config.velocityConstantColor) {
        color = { ...config.velocityColor, a: config.velocityAlpha };
      } else {
        const dynamicColor = setColorDependsOnVelocity(
          velocity,
          config.colorBorderVelMax,
          config.minVelocityColor,
          config.midVelocityColor,
          config.maxVelocityColor
        );
        color = { ...dynamicColor, a: config.velocityAlpha };
      }

      const arrow: ArrowPrimitive = {
        pose: {
          position: {
            x: pose.position.x,
            y: pose.position.y,
            z: pose.position.z + Math.max(BASE_Z_HEIGHT, velocity * config.velocityScale),
          },
          orientation: pose.orientation,
        },
        shaft_length: 0.2,
        shaft_diameter: 0.04,
        head_length: 0.1,
        head_diameter: 0.08,
        color,
      };

      velocityArrows.push(arrow);
    }

    if (velocityArrows.length > 0) {
      entities.push({
        id: `velocity_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 0, nsec: 200000000 },
        metadata: [],
        arrows: velocityArrows,
        cylinders: [],
        lines: [],
        spheres: [],
        texts: [],
        triangles: [],
        models: [],
        cubes: [],
      });
    }
  }

  if (config.viewVelocityText === "On") {
    const velocityTexts: TextPrimitive[] = [];

    for (let pointIdx = 0; pointIdx < msg.points.length; pointIdx++) {
      const point = msg.points[pointIdx]!;
      const pose = "point" in point ? point.point.pose : point.pose;
      const velocity =
        "point" in point ? point.point.longitudinal_velocity_mps : point.longitudinal_velocity_mps;

      velocityTexts.push({
        pose: {
          position: { ...pose.position, z: pose.position.z + BASE_Z_HEIGHT + 0.04 },
          orientation: pose.orientation,
        },
        billboard: true,
        font_size: config.velocityTextScale,
        scale_invariant: false,
        color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
        text: velocity.toFixed(2),
      });
    }

    if (velocityTexts.length > 0) {
      entities.push({
        id: `velocity_text_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 0, nsec: 200000000 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: [],
        spheres: [],
        texts: velocityTexts,
        triangles: [],
        models: [],
        cubes: [],
      });
    }
  }

  if (config.viewFootprint === "On") {
    const footprintLines: LinePrimitive[] = [];

    for (let pointIdx = 0; pointIdx < msg.points.length; pointIdx++) {
      const point = msg.points[pointIdx]!;
      const pose = "point" in point ? point.point.pose : point.pose;

      const yaw = getYawFromQuaternion(pose.orientation);
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);

      const offsetFromBaselink = config.offsetFromBaselink;
      const vehicleLength =
        vehicleInfo.wheel_base + vehicleInfo.front_overhang + vehicleInfo.rear_overhang;
      const vehicleWidth =
        vehicleInfo.wheel_tread + vehicleInfo.left_overhang + vehicleInfo.right_overhang;
      const top = vehicleLength - vehicleInfo.rear_overhang - offsetFromBaselink;
      const bottom = -vehicleInfo.rear_overhang + offsetFromBaselink;
      const left = -vehicleWidth / 2.0;
      const right = vehicleWidth / 2.0;

      const corners = [
        { x: top, y: left },
        { x: top, y: right },
        { x: bottom, y: right },
        { x: bottom, y: left },
      ];

      const color = { ...config.footprintColor, a: config.footprintAlpha };

      for (let i = 0; i < 4; i++) {
        const currCorner = corners[i]!;
        const nextCorner = corners[(i + 1) % 4]!;

        const x1 = pose.position.x + currCorner.x * cosYaw - currCorner.y * sinYaw;
        const y1 = pose.position.y + currCorner.x * sinYaw + currCorner.y * cosYaw;
        const x2 = pose.position.x + nextCorner.x * cosYaw - nextCorner.y * sinYaw;
        const y2 = pose.position.y + nextCorner.x * sinYaw + nextCorner.y * cosYaw;

        footprintLines.push({
          pose: {
            position: { x: 0, y: 0, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 },
          },
          type: 1,
          color,
          thickness: 0.05,
          scale_invariant: false,
          colors: [color, color],
          indices: [0, 1],
          points: [
            { x: x1, y: y1, z: pose.position.z + BASE_Z_HEIGHT + 0.02 },
            { x: x2, y: y2, z: pose.position.z + BASE_Z_HEIGHT + 0.02 },
          ],
        });
      }
    }

    if (footprintLines.length > 0) {
      entities.push({
        id: `footprint_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 0, nsec: 200000000 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: footprintLines,
        spheres: [],
        texts: [],
        triangles: [],
        models: [],
        cubes: [],
      });
    }
  }

  if (config.viewPoint === "On") {
    const pointSpheres: SceneUpdate["entities"][0]["spheres"] = [];

    for (let pointIdx = 0; pointIdx < msg.points.length; pointIdx++) {
      const point = msg.points[pointIdx]!;
      const pose = "point" in point ? point.point.pose : point.pose;

      const yaw = getYawFromQuaternion(pose.orientation);
      const offset = config.pointOffset;
      const baseX = pose.position.x + offset * Math.cos(yaw);
      const baseY = pose.position.y + offset * Math.sin(yaw);
      const baseZ = pose.position.z + BASE_Z_HEIGHT + 0.03;

      const color = { ...config.pointColor, a: config.pointAlpha };

      pointSpheres.push({
        pose: {
          position: { x: baseX, y: baseY, z: baseZ },
          orientation: { x: 0, y: 0, z: 0, w: 1 },
        },
        size: { x: config.pointRadius * 2, y: config.pointRadius * 2, z: config.pointRadius * 2 },
        color,
      });
    }

    if (pointSpheres.length > 0) {
      entities.push({
        id: `points_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 0, nsec: 200000000 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: [],
        spheres: pointSpheres,
        texts: [],
        triangles: [],
        models: [],
        cubes: [],
      });
    }
  }

  if ("left_bound" in msg && "right_bound" in msg && config.viewDrivableArea === "On") {
    const drivableAreaLines: LinePrimitive[] = [];

    if (msg.left_bound.length > 0 && msg.right_bound.length > 0) {
      const edgeColor = { ...config.drivableAreaColor, a: 1.0 };

      const leftBoundPoints = msg.left_bound.map(point => ({
        x: point.x,
        y: point.y,
        z: point.z + BASE_Z_HEIGHT + 0.05,
      }));

      const rightBoundPoints = msg.right_bound.map(point => ({
        x: point.x,
        y: point.y,
        z: point.z + BASE_Z_HEIGHT + 0.05,
      }));

      if (leftBoundPoints.length > 1) {
        for (let i = 0; i < leftBoundPoints.length - 1; i++) {
          const startPoint = leftBoundPoints[i]!;
          const endPoint = leftBoundPoints[i + 1]!;

          drivableAreaLines.push({
            type: 1,
            pose: {
              position: { x: 0, y: 0, z: 0 },
              orientation: { x: 0, y: 0, z: 0, w: 1 },
            },
            scale_invariant: false,
            color: edgeColor,
            thickness: config.drivableAreaWidth,
            colors: [edgeColor, edgeColor],
            indices: [0, 1],
            points: [startPoint, endPoint],
          });
        }
      }

      if (rightBoundPoints.length > 1) {
        for (let i = 0; i < rightBoundPoints.length - 1; i++) {
          const startPoint = rightBoundPoints[i]!;
          const endPoint = rightBoundPoints[i + 1]!;

          drivableAreaLines.push({
            type: 1,
            pose: {
              position: { x: 0, y: 0, z: 0 },
              orientation: { x: 0, y: 0, z: 0, w: 1 },
            },
            scale_invariant: false,
            color: edgeColor,
            thickness: config.drivableAreaWidth,
            colors: [edgeColor, edgeColor],
            indices: [0, 1],
            points: [startPoint, endPoint],
          });
        }
      }
    }

    if (drivableAreaLines.length > 0) {
      entities.push({
        id: `drivable_area_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 0, nsec: 200000000 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: drivableAreaLines,
        spheres: [],
        texts: [],
        triangles: [],
        models: [],
        cubes: [],
      });
    }
  }

  if (
    "points" in msg &&
    msg.points.length > 0 &&
    "time_from_start" in msg.points[0]! &&
    config.viewTimeText === "On"
  ) {
    const timeTexts: TextPrimitive[] = [];

    for (let pointIdx = 0; pointIdx < msg.points.length; pointIdx++) {
      const point = msg.points[pointIdx]!;
      if ("time_from_start" in point) {
        const pose = "point" in point ? (point as any).point.pose : (point as any).pose;
        const timeFromStart = point.time_from_start;
        const timeInSeconds = timeFromStart.sec + timeFromStart.nsec / 1e9;

        timeTexts.push({
          pose: {
            position: { ...pose.position, z: pose.position.z + BASE_Z_HEIGHT + 0.04 },
            orientation: pose.orientation,
          },
          billboard: true,
          font_size: Math.max(0.0001, config.timeTextScale),
          scale_invariant: true,
          color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
          text: timeInSeconds.toFixed(2),
        });
      }
    }

    if (timeTexts.length > 0) {
      entities.push({
        id: `time_text_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 0, nsec: 200000000 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: [],
        spheres: [],
        texts: timeTexts,
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

export function convertPath(msg: Path, event: Immutable<MessageEvent<Path>>): SceneUpdate {
  return convertPlanningMessage(msg, event, "Path");
}

export function convertPathWithLaneId(
  msg: PathWithLaneId,
  event: Immutable<MessageEvent<PathWithLaneId>>
): SceneUpdate {
  return convertPlanningMessage(msg, event, "PathWithLaneId");
}

export function convertTrajectory(
  msg: Trajectory,
  event: Immutable<MessageEvent<Trajectory>>
): SceneUpdate {
  return convertPlanningMessage(msg, event, "Trajectory");
}

export const PathSettings: Record<
  string,
  PanelSettings<unknown>
> = createSimplifiedPlanningSettings("Path");
export const PathWithLaneIdSettings: Record<
  string,
  PanelSettings<unknown>
> = createSimplifiedPlanningSettings("PathWithLaneId");
export const TrajectorySettings: Record<
  string,
  PanelSettings<unknown>
> = createSimplifiedPlanningSettings("Trajectory");
