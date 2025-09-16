import { Path } from "../msgs/planning/Path";
import { PathWithLaneId } from "../msgs/planning/PathWithLaneId";
import { Trajectory } from "../msgs/planning/Trajectory";
import { SceneUpdate, LinePrimitive, TextPrimitive, TriangleListPrimitive, ArrowPrimitive } from "@foxglove/schemas";
import { MessageEvent, Immutable, PanelSettings } from "@lichtblick/suite";
import { VehicleInfo } from "../config/VehicleInfos";
import { vehicleInfoManager } from "../panels/VehicleInfoPanel";

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface PlanningConfig {
  // Path settings
  viewPath: string;
  pathWidth: number;
  pathAlpha: number;
  minVelocityColor: Color;
  midVelocityColor: Color;
  maxVelocityColor: Color;
  fadeOutDistance: number;
  colorBorderVelMax: number;
  
  // Velocity settings
  viewVelocity: string;
  velocityAlpha: number;
  velocityScale: number;
  velocityConstantColor: boolean;
  velocityColor: Color;
  viewVelocityText: string;
  velocityTextScale: number;
  
  // Footprint settings
  viewFootprint: string;
  footprintAlpha: number;
  footprintColor: Color;
  offsetFromBaselink: number;
  
  // Point settings
  viewPoint: string;
  pointAlpha: number;
  pointColor: Color;
  pointRadius: number;
  pointOffset: number;
  
  // Slope text settings
  viewSlopeText: boolean;
  slopeTextScale: number;
  
  // Drivable area settings (for Path and PathWithLaneId)
  viewDrivableArea: string;
  drivableAreaAlpha: number;
  drivableAreaColor: Color;
  drivableAreaWidth: number;
  
  // Lane ID settings (for PathWithLaneId)
  viewLaneId: string;
  laneIdScale: number;
  
  // Time text settings (for Trajectory)
  viewTimeText: string;
  timeTextScale: number;
}

// Panel Settings for Planning Converter
export const PlanningSettings: Record<string, PanelSettings<unknown>> = {
  "3D": {
    settings: (config?: any) => ({
      fields: {
        
        // Path settings
        viewPath: {
          label: "View Path",
          input: "toggle",
          value: config?.viewPath ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide the path visualization"
        },
        pathWidth: {
          label: "Path Width",
          input: "number",
          value: config?.pathWidth ?? 2.0,
          min: 0.0,
          help: "Width of the path line"
        },
        pathAlpha: {
          label: "Path Alpha",
          input: "number",
          value: config?.pathAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of the path"
        },
        colorBorderVelMax: {
          label: "Color Border Velocity Max",
          input: "number",
          value: config?.colorBorderVelMax ?? 3.0,
          min: 0.0,
          help: "Maximum velocity for color gradient"
        },
        fadeOutDistance: {
          label: "Fade Out Distance",
          input: "number",
          value: config?.fadeOutDistance ?? 0.0,
          min: 0.0,
          help: "Distance from end to fade out path"
        },
        
        // Velocity settings
        viewVelocity: {
          label: "View Velocity",
          input: "toggle",
          value: config?.viewVelocity ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide velocity arrows"
        },
        velocityAlpha: {
          label: "Velocity Alpha",
          input: "number",
          value: config?.velocityAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of velocity arrows"
        },
        velocityScale: {
          label: "Velocity Scale",
          input: "number",
          value: config?.velocityScale ?? 0.3,
          min: 0.1,
          max: 10.0,
          help: "Scale factor for velocity arrow height"
        },
        viewVelocityText: {
          label: "View Velocity Text",
          input: "toggle",
          value: config?.viewVelocityText ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide velocity text"
        },
        velocityTextScale: {
          label: "Velocity Text Scale",
          input: "number",
          value: config?.velocityTextScale ?? 0.3,
          min: 0.1,
          max: 10.0,
          help: "Scale factor for velocity text"
        },
        
        // Footprint settings
        viewFootprint: {
          label: "View Footprint",
          input: "toggle",
          value: config?.viewFootprint ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide vehicle footprint"
        },
        footprintAlpha: {
          label: "Footprint Alpha",
          input: "number",
          value: config?.footprintAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of vehicle footprint"
        },
        offsetFromBaselink: {
          label: "Offset from BaseLink",
          input: "number",
          value: config?.offsetFromBaselink ?? 0.0,
          help: "Offset from base link"
        },
        
        // Point settings
        viewPoint: {
          label: "View Point",
          input: "toggle",
          value: config?.viewPoint ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide path points"
        },
        pointAlpha: {
          label: "Point Alpha",
          input: "number",
          value: config?.pointAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of path points"
        },
        pointRadius: {
          label: "Point Radius",
          input: "number",
          value: config?.pointRadius ?? 0.05,
          min: 0.0,
          help: "Radius of path points"
        },
        pointOffset: {
          label: "Point Offset",
          input: "number",
          value: config?.pointOffset ?? 0.0,
          help: "Offset for path points"
        },
        
        // Drivable area settings
        viewDrivableArea: {
          label: "View Drivable Area",
          input: "toggle",
          value: config?.viewDrivableArea ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide drivable area boundaries"
        },
        drivableAreaAlpha: {
          label: "Drivable Area Alpha",
          input: "number",
          value: config?.drivableAreaAlpha ?? 0.999,
          min: 0.0,
          max: 1.0,
          help: "Transparency of drivable area"
        },
        drivableAreaWidth: {
          label: "Drivable Area Width",
          input: "number",
          value: config?.drivableAreaWidth ?? 0.3,
          min: 0.001,
          help: "Width of drivable area boundaries"
        },
        
        // Lane ID settings (for PathWithLaneId)
        viewLaneId: {
          label: "View Lane ID",
          input: "toggle",
          value: config?.viewLaneId ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide lane ID text"
        },
        laneIdScale: {
          label: "Lane ID Scale",
          input: "number",
          value: config?.laneIdScale ?? 0.1,
          min: 0.0,
          help: "Scale factor for lane ID text"
        },
        
        // Time text settings (for Trajectory)
        viewTimeText: {
          label: "View Time Text",
          input: "toggle",
          value: config?.viewTimeText ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide time text"
        },
        timeTextScale: {
          label: "Time Text Scale",
          input: "number",
          value: config?.timeTextScale ?? 0.3,
          min: 0.0,
          max: 1.0,
          help: "Scale factor for time text"
        }
      }
    }),
    handler: (action, _config) => {
      if (action.action === "update") {
        console.log("Planning settings updated:", action.payload);
      }
    },
    defaultConfig: {
      viewPath: "Off",
      pathWidth: 2.0,
      pathAlpha: 1.0,
      minVelocityColor: { r: 0.247, g: 0.180, b: 0.890, a: 1.0 }, // #3F2EE3
      midVelocityColor: { r: 0.125, g: 0.541, b: 0.682, a: 1.0 }, // #208AAE
      maxVelocityColor: { r: 0.0, g: 0.902, b: 0.471, a: 1.0 }, // #00E678
      fadeOutDistance: 0.0,
      colorBorderVelMax: 3.0,
      viewVelocity: "Off",
      velocityAlpha: 1.0,
      velocityScale: 0.3,
      velocityConstantColor: false,
      velocityColor: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
      viewVelocityText: "Off",
      velocityTextScale: 0.3,
      viewFootprint: "Off",
      footprintAlpha: 1.0,
      footprintColor: { r: 0.902, g: 0.902, b: 0.196, a: 1.0 }, // #E6E632
      offsetFromBaselink: 0.0,
      viewPoint: "Off",
      pointAlpha: 1.0,
      pointColor: { r: 0.0, g: 0.235, b: 1.0, a: 1.0 }, // #003CFF
      pointRadius: 0.05,
      pointOffset: 0.0,
      viewSlopeText: false,
      slopeTextScale: 0.3,
      viewDrivableArea: "Off",
      drivableAreaAlpha: 0.999,
      drivableAreaColor: { r: 0.0, g: 0.580, b: 0.804, a: 1.0 }, // #0094CD
      drivableAreaWidth: 0.3,
      viewLaneId: "Off",
      laneIdScale: 0.1,
      viewTimeText: "Off",
      timeTextScale: 0.3
    }
  }
};

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
      a: 1.0
    };
  } else {
    // Interpolate between mid and max colors
    const localRatio = (ratio - 0.5) * 2.0;
    return {
      r: maxColor.r * localRatio + midColor.r * (1.0 - localRatio),
      g: maxColor.g * localRatio + midColor.g * (1.0 - localRatio),
      b: maxColor.b * localRatio + midColor.b * (1.0 - localRatio),
      a: 1.0
    };
  }
}

function getYawFromQuaternion(q: { x: number; y: number; z: number; w: number }): number {
  return Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z));
}

function calculateDistance(p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Helper function to detect message type
function getMessageType(msg: Path | PathWithLaneId | Trajectory): 'Path' | 'PathWithLaneId' | 'Trajectory' {
  if ('left_bound' in msg && 'right_bound' in msg) {
    // Check if it's PathWithLaneId by looking for lane_ids in points
    if (msg.points.length > 0 && 'lane_ids' in msg.points[0]!) {
      return 'PathWithLaneId';
    } else {
      return 'Path';
    }
  } else {
    return 'Trajectory';
  }
}

// Helper function to get default config for message type
function getDefaultConfigForMessageType(messageType: 'Path' | 'PathWithLaneId' | 'Trajectory'): PlanningConfig {
  const baseConfig = PlanningSettings["3D"]!.defaultConfig as PlanningConfig;
  
  switch (messageType) {
    case 'Path':
      return {
        ...baseConfig,
        // Path has drivable area boundaries
        viewDrivableArea: "Off",
        drivableAreaAlpha: 0.999,
        drivableAreaColor: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
        drivableAreaWidth: 0.3,
        // Path doesn't have lane IDs or time info
        viewLaneId: "Off",
        viewTimeText: "Off"
      };
    case 'PathWithLaneId':
      return {
        ...baseConfig,
        // PathWithLaneId has drivable area boundaries and lane IDs
        viewDrivableArea: "Off",
        drivableAreaAlpha: 0.999,
        drivableAreaColor: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
        drivableAreaWidth: 0.3,
        viewLaneId: "Off",
        laneIdScale: 0.1,
        // PathWithLaneId doesn't have time info
        viewTimeText: "Off"
      };
    case 'Trajectory':
      return {
        ...baseConfig,
        // Trajectory has time info but no drivable area or lane IDs
        viewTimeText: "Off",
        timeTextScale: 0.3,
        // Trajectory doesn't have drivable area or lane IDs
        viewDrivableArea: "Off",
        viewLaneId: "Off"
      };
    default:
      return baseConfig;
  }
}


// Generic converter function for Path, PathWithLaneId, and Trajectory
export function convertPlanningMessage<T extends Path | PathWithLaneId | Trajectory>(
  msg: T,
  event: Immutable<MessageEvent<T>>
): SceneUpdate {
  // Get message type specific config
  const messageType = getMessageType(msg);
  const config = (event.topicConfig as PlanningConfig) || getDefaultConfigForMessageType(messageType);
  const vehicleInfo: VehicleInfo = vehicleInfoManager.getCurrentVehicle();
  
  const entities: any[] = [];
  
  if (msg.points.length === 0) {
    return {
      deletions: [],
      entities: []
    };
  }
  
  // Calculate fade out alphas
  const alphas = new Array(msg.points.length).fill(config.pathAlpha);
  if (config.fadeOutDistance > 0) {
    alphas[alphas.length - 1] = 0.0;
    let cumulativeDistance = 0.0;
    
    for (let pointIdx = msg.points.length - 1; pointIdx > 0; pointIdx--) {
      const currPoint = msg.points[pointIdx]!;
      const prevPoint = msg.points[pointIdx - 1]!;
      
      const currPose = 'point' in currPoint ? currPoint.point.pose : currPoint.pose;
      const prevPose = 'point' in prevPoint ? prevPoint.point.pose : prevPoint.pose;
      
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
  
  // Path visualization (as triangle strip, matching rviz implementation)
  if (config.viewPath === "On") {
    const alphas: number[] = [];
    
    // Calculate fade out alphas
    if (config.fadeOutDistance > 0.0) {
      let distanceFromEnd = 0.0;
      for (let i = msg.points.length - 1; i > 0; i--) {
        const currentPoint = msg.points[i]!;
        const prevPoint = msg.points[i - 1]!;
        const currentPose = 'point' in currentPoint ? currentPoint.point.pose : currentPoint.pose;
        const prevPose = 'point' in prevPoint ? prevPoint.point.pose : prevPoint.pose;
        
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
    
    // Create triangle strip for path (matching rviz OT_TRIANGLE_STRIP)
    const vertices: { x: number; y: number; z: number }[] = [];
    const colors: Color[] = [];
    const indices: number[] = [];
    
    for (let pointIdx = 0; pointIdx < msg.points.length; pointIdx++) {
      const point = msg.points[pointIdx]!;
      const pose = 'point' in point ? point.point.pose : point.pose;
      const velocity = 'point' in point ? point.point.longitudinal_velocity_mps : point.longitudinal_velocity_mps;
      
      const baseColor = setColorDependsOnVelocity(
        velocity,
        config.colorBorderVelMax,
        config.minVelocityColor,
        config.midVelocityColor,
        config.maxVelocityColor
      );
      const color = { ...baseColor, a: alphas[pointIdx] || config.pathAlpha };
      
      // Calculate path width (use vehicle width by default, matching rviz)
      const pathWidth = config.pathWidth;
      const halfWidth = pathWidth / 2.0;
      
      // Apply quaternion rotation to local coordinates (matching rviz implementation)
      const q = pose.orientation;
      const qw = q.w;
      const qx = q.x;
      const qy = q.y;
      const qz = q.z;
      
      // Right side vertex (local: 0, half_width, 0)
      const rightLocal = { x: 0, y: halfWidth, z: 0 };
      const rightGlobal = {
        x: rightLocal.x * (1 - 2*qy*qy - 2*qz*qz) + rightLocal.y * (2*qx*qy - 2*qw*qz) + rightLocal.z * (2*qx*qz + 2*qw*qy),
        y: rightLocal.x * (2*qx*qy + 2*qw*qz) + rightLocal.y * (1 - 2*qx*qx - 2*qz*qz) + rightLocal.z * (2*qy*qz - 2*qw*qx),
        z: rightLocal.x * (2*qx*qz - 2*qw*qy) + rightLocal.y * (2*qy*qz + 2*qw*qx) + rightLocal.z * (1 - 2*qx*qx - 2*qy*qy)
      };
      
      vertices.push({
        x: pose.position.x + rightGlobal.x,
        y: pose.position.y + rightGlobal.y,
        z: pose.position.z + rightGlobal.z + 0.1 // Slightly raise path to avoid map occlusion
      });
      colors.push(color);
      
      // Left side vertex (local: 0, -half_width, 0)
      const leftLocal = { x: 0, y: -halfWidth, z: 0 };
      const leftGlobal = {
        x: leftLocal.x * (1 - 2*qy*qy - 2*qz*qz) + leftLocal.y * (2*qx*qy - 2*qw*qz) + leftLocal.z * (2*qx*qz + 2*qw*qy),
        y: leftLocal.x * (2*qx*qy + 2*qw*qz) + leftLocal.y * (1 - 2*qx*qx - 2*qz*qz) + leftLocal.z * (2*qy*qz - 2*qw*qx),
        z: leftLocal.x * (2*qx*qz - 2*qw*qy) + leftLocal.y * (2*qy*qz + 2*qw*qx) + leftLocal.z * (1 - 2*qx*qx - 2*qy*qy)
      };
      
      vertices.push({
        x: pose.position.x + leftGlobal.x,
        y: pose.position.y + leftGlobal.y,
        z: pose.position.z + leftGlobal.z + 0.1
      });
      colors.push(color);
    }
    
    // Create triangle indices for triangle strip
    for (let i = 0; i < vertices.length - 2; i += 2) {
      // First triangle: current right, current left, next right
      indices.push(i, i + 1, i + 2);
      // Second triangle: current left, next right, next left
      indices.push(i + 1, i + 2, i + 3);
    }
    
    if (vertices.length > 0) {
      const pathTriangle: TriangleListPrimitive = {
        pose: {
          position: { x: 0, y: 0, z: 0 },
          orientation: { x: 0, y: 0, z: 0, w: 1 }
        },
        color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }, // Base color (overridden by per-vertex colors)
        points: vertices,
        colors: colors,
        indices: indices
      };
      
      entities.push({
        id: `path_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 1, nsec: 0 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: [],
        spheres: [],
        texts: [],
        triangles: [pathTriangle],
        models: [],
        cubes: []
      });
    }
  }
  
  // Velocity visualization (as arrows, matching rviz implementation)
  if (config.viewVelocity === "On") {
    const velocityArrows: ArrowPrimitive[] = [];
    
    for (const point of msg.points) {
      const pose = 'point' in point ? point.point.pose : point.pose;
      const velocity = 'point' in point ? point.point.longitudinal_velocity_mps : point.longitudinal_velocity_mps;
      
      // Determine color based on velocity (matching rviz)
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
      
      // Create arrow for each point
      const arrow: ArrowPrimitive = {
        pose: {
          position: {
            x: pose.position.x,
            y: pose.position.y,
            z: pose.position.z + velocity * config.velocityScale // Height based on velocity
          },
          orientation: pose.orientation
        },
        shaft_length: 0.2,
        shaft_diameter: 0.04,
        head_length: 0.1,
        head_diameter: 0.08,
        color
      };
      
      velocityArrows.push(arrow);
    }
    
    if (velocityArrows.length > 0) {
      entities.push({
        id: `velocity_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 1, nsec: 0 },
        metadata: [],
        arrows: velocityArrows,
        cylinders: [],
        lines: [],
        spheres: [],
        texts: [],
        triangles: [],
        models: [],
        cubes: []
      });
    }
  }
  
  // Velocity text visualization
  if (config.viewVelocityText === "On") {
    const velocityTexts: TextPrimitive[] = [];
    
    for (let pointIdx = 0; pointIdx < msg.points.length; pointIdx++) {
      const point = msg.points[pointIdx]!;
      const pose = 'point' in point ? point.point.pose : point.pose;
      const velocity = 'point' in point ? point.point.longitudinal_velocity_mps : point.longitudinal_velocity_mps;
      
      velocityTexts.push({
        pose: {
          position: pose.position,
          orientation: pose.orientation
        },
        billboard: true,
        font_size: config.velocityTextScale,
        scale_invariant: false,
        color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
        text: velocity.toFixed(2)
      });
    }
    
    if (velocityTexts.length > 0) {
      entities.push({
        id: `velocity_text_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 1, nsec: 0 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: [],
        spheres: [],
        texts: velocityTexts,
        triangles: [],
        models: [],
        cubes: []
      });
    }
  }
  
  // Footprint visualization
  if (config.viewFootprint === "On") {
    const footprintLines: LinePrimitive[] = [];
    
    for (let pointIdx = 0; pointIdx < msg.points.length; pointIdx++) {
      const point = msg.points[pointIdx]!;
      const pose = 'point' in point ? point.point.pose : point.pose;
      
      const yaw = getYawFromQuaternion(pose.orientation);
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      
      const offsetFromBaselink = config.offsetFromBaselink;
      const vehicleLength = vehicleInfo.wheel_base + vehicleInfo.front_overhang + vehicleInfo.rear_overhang;
      const vehicleWidth = vehicleInfo.wheel_tread + vehicleInfo.left_overhang + vehicleInfo.right_overhang;
      const top = vehicleLength - vehicleInfo.rear_overhang - offsetFromBaselink;
      const bottom = -vehicleInfo.rear_overhang + offsetFromBaselink;
      const left = -vehicleWidth / 2.0;
      const right = vehicleWidth / 2.0;
      
      const corners = [
        { x: top, y: left },
        { x: top, y: right },
        { x: bottom, y: right },
        { x: bottom, y: left }
      ];
      
      const color = { ...config.footprintColor, a: config.footprintAlpha };
      
      // Draw vehicle footprint rectangle
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
            orientation: { x: 0, y: 0, z: 0, w: 1 }
          },
          type: 1, // LINE_LIST
          color,
          thickness: 0.05,
          scale_invariant: false,
          colors: [color, color],
          indices: [0, 1],
          points: [
            { x: x1, y: y1, z: pose.position.z },
            { x: x2, y: y2, z: pose.position.z }
          ]
        });
      }
    }
    
    if (footprintLines.length > 0) {
      entities.push({
        id: `footprint_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 1, nsec: 0 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: footprintLines,
        spheres: [],
        texts: [],
        triangles: [],
        models: [],
        cubes: []
      });
    }
  }
  
  // Point visualization
  if (config.viewPoint === "On") {
    const pointSpheres: any[] = [];
    
    for (let pointIdx = 0; pointIdx < msg.points.length; pointIdx++) {
      const point = msg.points[pointIdx]!;
      const pose = 'point' in point ? point.point.pose : point.pose;
      
      const yaw = getYawFromQuaternion(pose.orientation);
      const offset = config.pointOffset;
      const baseX = pose.position.x + offset * Math.cos(yaw);
      const baseY = pose.position.y + offset * Math.sin(yaw);
      const baseZ = pose.position.z;
      
      const color = { ...config.pointColor, a: config.pointAlpha };
      
      pointSpheres.push({
        pose: {
          position: { x: baseX, y: baseY, z: baseZ },
          orientation: { x: 0, y: 0, z: 0, w: 1 }
        },
        size: { x: config.pointRadius * 2, y: config.pointRadius * 2, z: config.pointRadius * 2 },
        color
      });
    }
    
    if (pointSpheres.length > 0) {
      entities.push({
        id: `points_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 1, nsec: 0 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: [],
        spheres: pointSpheres,
        texts: [],
        triangles: [],
        models: [],
        cubes: []
      });
    }
  }
  
  // Drivable area visualization (for Path and PathWithLaneId)
  if ('left_bound' in msg && 'right_bound' in msg && config.viewDrivableArea === "On") {
    const drivableAreaTriangles: TriangleListPrimitive[] = [];
    
    if (msg.left_bound.length > 0 && msg.right_bound.length > 0) {
      const color = { ...config.drivableAreaColor, a: config.drivableAreaAlpha };
      
      // Create triangles for drivable area
      for (let i = 0; i < Math.min(msg.left_bound.length, msg.right_bound.length) - 1; i++) {
        const left1 = msg.left_bound[i]!;
        const left2 = msg.left_bound[i + 1]!;
        const right1 = msg.right_bound[i]!;
        const right2 = msg.right_bound[i + 1]!;
        
        // Triangle 1: left1, right1, left2
        drivableAreaTriangles.push({
          pose: {
            position: { x: 0, y: 0, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 }
          },
          color,
          points: [left1, right1, left2],
          colors: [color, color, color],
          indices: [0, 1, 2]
        });
        
        // Triangle 2: left2, right1, right2
        drivableAreaTriangles.push({
          pose: {
            position: { x: 0, y: 0, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 }
          },
          color,
          points: [left2, right1, right2],
          colors: [color, color, color],
          indices: [0, 1, 2]
        });
      }
    }
    
    if (drivableAreaTriangles.length > 0) {
      entities.push({
        id: `drivable_area_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 1, nsec: 0 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: [],
        spheres: [],
        texts: [],
        triangles: drivableAreaTriangles,
        models: [],
        cubes: []
      });
    }
  }
  
  // Lane ID visualization (for PathWithLaneId)
  if ('points' in msg && msg.points.length > 0 && 'lane_ids' in msg.points[0]! && config.viewLaneId === "On") {
    const laneIdTexts: TextPrimitive[] = [];
    
    for (let pointIdx = 0; pointIdx < msg.points.length; pointIdx++) {
      const point = msg.points[pointIdx] as any;
      if ('lane_ids' in point && point.lane_ids.length > 0) {
        const pose = 'point' in point ? point.point.pose : point.pose;
        const laneIdsStr = point.lane_ids.map((id: number) => id.toString()).join(', ');
        
        laneIdTexts.push({
          pose: {
            position: pose.position,
            orientation: pose.orientation
          },
          billboard: true,
          font_size: config.laneIdScale,
          scale_invariant: false,
          color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
          text: laneIdsStr
        });
      }
    }
    
    if (laneIdTexts.length > 0) {
      entities.push({
        id: `lane_id_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 1, nsec: 0 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: [],
        spheres: [],
        texts: laneIdTexts,
        triangles: [],
        models: [],
        cubes: []
      });
    }
  }
  
  // Time text visualization (for Trajectory)
  if ('points' in msg && msg.points.length > 0 && 'time_from_start' in msg.points[0]! && config.viewTimeText === "On") {
    const timeTexts: TextPrimitive[] = [];
    
    for (let pointIdx = 0; pointIdx < msg.points.length; pointIdx++) {
      const point = msg.points[pointIdx] as any;
      if ('time_from_start' in point) {
        const pose = 'point' in point ? point.point.pose : point.pose;
        const timeFromStart = point.time_from_start;
        const timeInSeconds = timeFromStart.sec + timeFromStart.nsec / 1e9;
        
        timeTexts.push({
          pose: {
            position: pose.position,
            orientation: pose.orientation
          },
          billboard: true,
          font_size: Math.max(0.0001, config.timeTextScale),
          scale_invariant: true,
          color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
          text: timeInSeconds.toFixed(2)
        });
      }
    }
    
    if (timeTexts.length > 0) {
      entities.push({
        id: `time_text_${event.topic}`,
        timestamp: msg.header.stamp,
        frame_id: msg.header.frame_id,
        frame_locked: false,
        lifetime: { sec: 1, nsec: 0 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: [],
        spheres: [],
        texts: timeTexts,
        triangles: [],
        models: [],
        cubes: []
      });
    }
  }
  
  return {
    deletions: [],
    entities
  };
}

// Specific converter functions for each message type
export function convertPath(msg: Path, event: Immutable<MessageEvent<Path>>): SceneUpdate {
  return convertPlanningMessage(msg, event);
}

export function convertPathWithLaneId(msg: PathWithLaneId, event: Immutable<MessageEvent<PathWithLaneId>>): SceneUpdate {
  return convertPlanningMessage(msg, event);
}

export function convertTrajectory(msg: Trajectory, event: Immutable<MessageEvent<Trajectory>>): SceneUpdate {
  return convertPlanningMessage(msg, event);
}

// Path-specific settings (has drivable area, no lane IDs, no time info)
export const PathSettings: Record<string, PanelSettings<unknown>> = {
  "3D": {
    settings: (config?: any) => ({
      fields: {
        // Common settings
        viewPath: {
          label: "View Path",
          input: "toggle",
          value: config?.viewPath ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide the path visualization"
        },
        pathWidth: {
          label: "Path Width",
          input: "number",
          value: config?.pathWidth ?? 2.0,
          min: 0.0,
          help: "Width of the path line"
        },
        pathAlpha: {
          label: "Path Alpha",
          input: "number",
          value: config?.pathAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of the path"
        },
        colorBorderVelMax: {
          label: "Color Border Velocity Max",
          input: "number",
          value: config?.colorBorderVelMax ?? 3.0,
          min: 0.0,
          help: "Maximum velocity for color gradient"
        },
        fadeOutDistance: {
          label: "Fade Out Distance",
          input: "number",
          value: config?.fadeOutDistance ?? 0.0,
          min: 0.0,
          help: "Distance from end to fade out path"
        },
        
        // Velocity settings
        viewVelocity: {
          label: "View Velocity",
          input: "toggle",
          value: config?.viewVelocity ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide velocity arrows"
        },
        velocityAlpha: {
          label: "Velocity Alpha",
          input: "number",
          value: config?.velocityAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of velocity arrows"
        },
        velocityScale: {
          label: "Velocity Scale",
          input: "number",
          value: config?.velocityScale ?? 0.3,
          min: 0.1,
          max: 10.0,
          help: "Scale factor for velocity arrow height"
        },
        viewVelocityText: {
          label: "View Velocity Text",
          input: "toggle",
          value: config?.viewVelocityText ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide velocity text"
        },
        velocityTextScale: {
          label: "Velocity Text Scale",
          input: "number",
          value: config?.velocityTextScale ?? 0.3,
          min: 0.1,
          max: 10.0,
          help: "Scale factor for velocity text"
        },
        
        // Footprint settings
        viewFootprint: {
          label: "View Footprint",
          input: "toggle",
          value: config?.viewFootprint ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide vehicle footprint"
        },
        footprintAlpha: {
          label: "Footprint Alpha",
          input: "number",
          value: config?.footprintAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of vehicle footprint"
        },
        offsetFromBaselink: {
          label: "Offset from BaseLink",
          input: "number",
          value: config?.offsetFromBaselink ?? 0.0,
          help: "Offset from base link"
        },
        
        // Point settings
        viewPoint: {
          label: "View Point",
          input: "toggle",
          value: config?.viewPoint ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide path points"
        },
        pointAlpha: {
          label: "Point Alpha",
          input: "number",
          value: config?.pointAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of path points"
        },
        pointRadius: {
          label: "Point Radius",
          input: "number",
          value: config?.pointRadius ?? 0.05,
          min: 0.0,
          help: "Radius of path points"
        },
        pointOffset: {
          label: "Point Offset",
          input: "number",
          value: config?.pointOffset ?? 0.0,
          help: "Offset for path points"
        },
        
        // Drivable area settings (Path has this)
        viewDrivableArea: {
          label: "View Drivable Area",
          input: "toggle",
          value: config?.viewDrivableArea ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide drivable area boundaries"
        },
        drivableAreaAlpha: {
          label: "Drivable Area Alpha",
          input: "number",
          value: config?.drivableAreaAlpha ?? 0.999,
          min: 0.0,
          max: 1.0,
          help: "Transparency of drivable area"
        },
        drivableAreaWidth: {
          label: "Drivable Area Width",
          input: "number",
          value: config?.drivableAreaWidth ?? 0.3,
          min: 0.001,
          help: "Width of drivable area boundaries"
        }
      }
    }),
    handler: (action, _config) => {
      if (action.action === "update") {
        console.log("Path settings updated:", action.payload);
      }
    },
    defaultConfig: {
      viewPath: "Off",
      pathWidth: 2.0,
      pathAlpha: 1.0,
      colorBorderVelMax: 3.0,
      fadeOutDistance: 0.0,
      viewVelocity: "Off",
      velocityAlpha: 1.0,
      velocityScale: 0.3,
      velocityConstantColor: false,
      velocityColor: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
      viewVelocityText: "Off",
      velocityTextScale: 0.3,
      viewFootprint: "Off",
      footprintAlpha: 1.0,
      footprintColor: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
      offsetFromBaselink: 0.0,
      viewPoint: "Off",
      pointAlpha: 1.0,
      pointColor: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
      pointRadius: 0.05,
      pointOffset: 0.0,
      viewDrivableArea: "Off",
      drivableAreaAlpha: 0.999,
      drivableAreaColor: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
      drivableAreaWidth: 0.3,
      minVelocityColor: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
      midVelocityColor: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
      maxVelocityColor: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 }
    }
  }
};

// PathWithLaneId-specific settings (has drivable area, lane IDs, no time info)
export const PathWithLaneIdSettings: Record<string, PanelSettings<unknown>> = {
  "3D": {
    settings: (config?: any) => ({
      fields: {
        // Common settings
        viewPath: {
          label: "View Path",
          input: "toggle",
          value: config?.viewPath ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide the path visualization"
        },
        pathWidth: {
          label: "Path Width",
          input: "number",
          value: config?.pathWidth ?? 2.0,
          min: 0.0,
          help: "Width of the path line"
        },
        pathAlpha: {
          label: "Path Alpha",
          input: "number",
          value: config?.pathAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of the path"
        },
        colorBorderVelMax: {
          label: "Color Border Velocity Max",
          input: "number",
          value: config?.colorBorderVelMax ?? 3.0,
          min: 0.0,
          help: "Maximum velocity for color gradient"
        },
        fadeOutDistance: {
          label: "Fade Out Distance",
          input: "number",
          value: config?.fadeOutDistance ?? 0.0,
          min: 0.0,
          help: "Distance from end to fade out path"
        },
        
        // Velocity settings
        viewVelocity: {
          label: "View Velocity",
          input: "toggle",
          value: config?.viewVelocity ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide velocity arrows"
        },
        velocityAlpha: {
          label: "Velocity Alpha",
          input: "number",
          value: config?.velocityAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of velocity arrows"
        },
        velocityScale: {
          label: "Velocity Scale",
          input: "number",
          value: config?.velocityScale ?? 0.3,
          min: 0.1,
          max: 10.0,
          help: "Scale factor for velocity arrow height"
        },
        viewVelocityText: {
          label: "View Velocity Text",
          input: "toggle",
          value: config?.viewVelocityText ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide velocity text"
        },
        velocityTextScale: {
          label: "Velocity Text Scale",
          input: "number",
          value: config?.velocityTextScale ?? 0.3,
          min: 0.1,
          max: 10.0,
          help: "Scale factor for velocity text"
        },
        
        // Footprint settings
        viewFootprint: {
          label: "View Footprint",
          input: "toggle",
          value: config?.viewFootprint ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide vehicle footprint"
        },
        footprintAlpha: {
          label: "Footprint Alpha",
          input: "number",
          value: config?.footprintAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of vehicle footprint"
        },
        offsetFromBaselink: {
          label: "Offset from BaseLink",
          input: "number",
          value: config?.offsetFromBaselink ?? 0.0,
          help: "Offset from base link"
        },
        
        // Point settings
        viewPoint: {
          label: "View Point",
          input: "toggle",
          value: config?.viewPoint ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide path points"
        },
        pointAlpha: {
          label: "Point Alpha",
          input: "number",
          value: config?.pointAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of path points"
        },
        pointRadius: {
          label: "Point Radius",
          input: "number",
          value: config?.pointRadius ?? 0.05,
          min: 0.0,
          help: "Radius of path points"
        },
        pointOffset: {
          label: "Point Offset",
          input: "number",
          value: config?.pointOffset ?? 0.0,
          help: "Offset for path points"
        },
        
        // Drivable area settings (PathWithLaneId has this)
        viewDrivableArea: {
          label: "View Drivable Area",
          input: "toggle",
          value: config?.viewDrivableArea ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide drivable area boundaries"
        },
        drivableAreaAlpha: {
          label: "Drivable Area Alpha",
          input: "number",
          value: config?.drivableAreaAlpha ?? 0.999,
          min: 0.0,
          max: 1.0,
          help: "Transparency of drivable area"
        },
        drivableAreaWidth: {
          label: "Drivable Area Width",
          input: "number",
          value: config?.drivableAreaWidth ?? 0.3,
          min: 0.001,
          help: "Width of drivable area boundaries"
        },
        
        // Lane ID settings (PathWithLaneId has this)
        viewLaneId: {
          label: "View Lane ID",
          input: "toggle",
          value: config?.viewLaneId ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide lane ID text"
        },
        laneIdScale: {
          label: "Lane ID Scale",
          input: "number",
          value: config?.laneIdScale ?? 0.1,
          min: 0.0,
          help: "Scale factor for lane ID text"
        }
      }
    }),
    handler: (action, _config) => {
      if (action.action === "update") {
        console.log("PathWithLaneId settings updated:", action.payload);
      }
    },
    defaultConfig: {
      viewPath: "Off",
      pathWidth: 2.0,
      pathAlpha: 1.0,
      colorBorderVelMax: 3.0,
      fadeOutDistance: 0.0,
      viewVelocity: "Off",
      velocityAlpha: 1.0,
      velocityScale: 0.3,
      velocityConstantColor: false,
      velocityColor: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
      viewVelocityText: "Off",
      velocityTextScale: 0.3,
      viewFootprint: "Off",
      footprintAlpha: 1.0,
      footprintColor: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
      offsetFromBaselink: 0.0,
      viewPoint: "Off",
      pointAlpha: 1.0,
      pointColor: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
      pointRadius: 0.05,
      pointOffset: 0.0,
      viewDrivableArea: "Off",
      drivableAreaAlpha: 0.999,
      drivableAreaColor: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
      drivableAreaWidth: 0.3,
      viewLaneId: "Off",
      laneIdScale: 0.1,
      minVelocityColor: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
      midVelocityColor: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
      maxVelocityColor: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 }
    }
  }
};

// Trajectory-specific settings (has time info, no drivable area, no lane IDs)
export const TrajectorySettings: Record<string, PanelSettings<unknown>> = {
  "3D": {
    settings: (config?: any) => ({
      fields: {
        // Common settings
        viewPath: {
          label: "View Path",
          input: "toggle",
          value: config?.viewPath ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide the path visualization"
        },
        pathWidth: {
          label: "Path Width",
          input: "number",
          value: config?.pathWidth ?? 2.0,
          min: 0.0,
          help: "Width of the path line"
        },
        pathAlpha: {
          label: "Path Alpha",
          input: "number",
          value: config?.pathAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of the path"
        },
        colorBorderVelMax: {
          label: "Color Border Velocity Max",
          input: "number",
          value: config?.colorBorderVelMax ?? 3.0,
          min: 0.0,
          help: "Maximum velocity for color gradient"
        },
        fadeOutDistance: {
          label: "Fade Out Distance",
          input: "number",
          value: config?.fadeOutDistance ?? 0.0,
          min: 0.0,
          help: "Distance from end to fade out path"
        },
        
        // Velocity settings
        viewVelocity: {
          label: "View Velocity",
          input: "toggle",
          value: config?.viewVelocity ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide velocity arrows"
        },
        velocityAlpha: {
          label: "Velocity Alpha",
          input: "number",
          value: config?.velocityAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of velocity arrows"
        },
        velocityScale: {
          label: "Velocity Scale",
          input: "number",
          value: config?.velocityScale ?? 0.3,
          min: 0.1,
          max: 10.0,
          help: "Scale factor for velocity arrow height"
        },
        viewVelocityText: {
          label: "View Velocity Text",
          input: "toggle",
          value: config?.viewVelocityText ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide velocity text"
        },
        velocityTextScale: {
          label: "Velocity Text Scale",
          input: "number",
          value: config?.velocityTextScale ?? 0.3,
          min: 0.1,
          max: 10.0,
          help: "Scale factor for velocity text"
        },
        
        // Footprint settings
        viewFootprint: {
          label: "View Footprint",
          input: "toggle",
          value: config?.viewFootprint ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide vehicle footprint"
        },
        footprintAlpha: {
          label: "Footprint Alpha",
          input: "number",
          value: config?.footprintAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of vehicle footprint"
        },
        offsetFromBaselink: {
          label: "Offset from BaseLink",
          input: "number",
          value: config?.offsetFromBaselink ?? 0.0,
          help: "Offset from base link"
        },
        
        // Point settings
        viewPoint: {
          label: "View Point",
          input: "toggle",
          value: config?.viewPoint ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide path points"
        },
        pointAlpha: {
          label: "Point Alpha",
          input: "number",
          value: config?.pointAlpha ?? 1.0,
          min: 0.0,
          max: 1.0,
          help: "Transparency of path points"
        },
        pointRadius: {
          label: "Point Radius",
          input: "number",
          value: config?.pointRadius ?? 0.05,
          min: 0.0,
          help: "Radius of path points"
        },
        pointOffset: {
          label: "Point Offset",
          input: "number",
          value: config?.pointOffset ?? 0.0,
          help: "Offset for path points"
        },
        
        // Time text settings (Trajectory has this)
        viewTimeText: {
          label: "View Time Text",
          input: "toggle",
          value: config?.viewTimeText ?? "Off",
          options: ["Off", "On"],
          help: "Show/hide time text"
        },
        timeTextScale: {
          label: "Time Text Scale",
          input: "number",
          value: config?.timeTextScale ?? 0.3,
          min: 0.0,
          max: 1.0,
          help: "Scale factor for time text"
        }
      }
    }),
    handler: (action, _config) => {
      if (action.action === "update") {
        console.log("Trajectory settings updated:", action.payload);
      }
    },
    defaultConfig: {
      viewPath: "Off",
      pathWidth: 2.0,
      pathAlpha: 1.0,
      colorBorderVelMax: 3.0,
      fadeOutDistance: 0.0,
      viewVelocity: "Off",
      velocityAlpha: 1.0,
      velocityScale: 0.3,
      velocityConstantColor: false,
      velocityColor: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
      viewVelocityText: "Off",
      velocityTextScale: 0.3,
      viewFootprint: "Off",
      footprintAlpha: 1.0,
      footprintColor: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
      offsetFromBaselink: 0.0,
      viewPoint: "Off",
      pointAlpha: 1.0,
      pointColor: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
      pointRadius: 0.05,
      pointOffset: 0.0,
      viewTimeText: "Off",
      timeTextScale: 0.3,
      minVelocityColor: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
      midVelocityColor: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
      maxVelocityColor: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 }
    }
  }
};

