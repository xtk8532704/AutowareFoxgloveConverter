export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Global base z-height for all visualizations
export const BASE_Z_HEIGHT = 0.01;

export interface PlanningConfig {
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

  // Drivable area settings (for Path and PathWithLaneId)
  viewDrivableArea: string;
  drivableAreaAlpha: number;
  drivableAreaColor: Color;
  drivableAreaWidth: number;

  // Time text settings (for Trajectory)
  viewTimeText: string;
  timeTextScale: number;
}

// Base configuration with defaults from rviz plugin
const BASE_CONFIG: PlanningConfig = {
  viewPath: "On",
  pathWidth: 2.0,
  pathAlpha: 1.0,
  minVelocityColor: { r: 0.247, g: 0.18, b: 0.89, a: 1.0 }, // #3F2EE3
  midVelocityColor: { r: 0.125, g: 0.541, b: 0.682, a: 1.0 }, // #208AAE
  maxVelocityColor: { r: 0.0, g: 0.902, b: 0.471, a: 1.0 }, // #00E678
  fadeOutDistance: 0.0,
  colorBorderVelMax: 3.0,

  viewVelocity: "On",
  velocityAlpha: 1.0,
  velocityScale: 0.3,
  velocityConstantColor: false,
  velocityColor: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }, // Qt::black
  viewVelocityText: "Off",
  velocityTextScale: 0.3,

  viewFootprint: "Off",
  footprintAlpha: 1.0,
  footprintColor: { r: 0.902, g: 0.902, b: 0.196, a: 1.0 }, // QColor(230, 230, 50)
  offsetFromBaselink: 0.0,

  viewPoint: "Off",
  pointAlpha: 1.0,
  pointColor: { r: 0.0, g: 0.235, b: 1.0, a: 1.0 }, // QColor(0, 60, 255)
  pointRadius: 0.1,
  pointOffset: 0.0,

  viewDrivableArea: "Off",
  drivableAreaAlpha: 0.999,
  drivableAreaColor: { r: 0.0, g: 0.58, b: 0.8, a: 1.0 }, // QColor(0, 148, 205)
  drivableAreaWidth: 0.3,

  viewTimeText: "Off",
  timeTextScale: 0.3,
};

// Message-specific configurations
export const TRAJECTORY_CONFIG: PlanningConfig = {
  ...BASE_CONFIG,
  pathAlpha: 0.9999,
  viewTimeText: "Off",
};

export const PATH_CONFIG: PlanningConfig = {
  ...BASE_CONFIG,
  pathAlpha: 0.4,
};

export const PATH_WITH_LANE_ID_CONFIG: PlanningConfig = {
  ...BASE_CONFIG,
  pathAlpha: 0.4,
};

// Export default configs
export const PLANNING_CONFIGS = {
  Path: PATH_CONFIG,
  PathWithLaneId: PATH_WITH_LANE_ID_CONFIG,
  Trajectory: TRAJECTORY_CONFIG,
} as const;

// Helper function to get config for message type
export function getPlanningConfig(
  messageType: "Path" | "PathWithLaneId" | "Trajectory"
): PlanningConfig {
  return PLANNING_CONFIGS[messageType];
}
