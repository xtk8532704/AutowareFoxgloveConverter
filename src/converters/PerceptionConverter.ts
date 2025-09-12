import { CubePrimitive, SceneUpdate, SpherePrimitive, LinePrimitive } from "@foxglove/schemas";
import { PredictedObjects } from "../msgs/perception/PredictedObjects";
import { TrackedObjects } from "../msgs/perception/TrackedObjects";
import { DetectedObjects } from "../msgs/perception/DetectedObjects";
import { Header } from "../msgs/base/Header";
import { Point } from "../msgs/base/Point";
import { Orientation } from "../msgs/base/Orientation";
import { Dimensions } from "../msgs/base/Dimensions";

type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

const colorMap: Record<number, Color> = {
  0: { r: 1.0, g: 1.0, b: 1.0, a: 0.5 }, // UNKNOWN // white // hex: #FFFFFF
  1: { r: 1.0, g: 0.0, b: 0.0, a: 0.5 }, // CAR // red // hex: #FF0000
  2: { r: 1.0, g: 0.5, b: 0.5, a: 0.5 }, // BICYCLE // pink // hex: #FF8080
  3: { r: 0.0, g: 0.5, b: 1.0, a: 0.5 }, // BUS // blue // hex: #0080FF
  4: { r: 0.0, g: 0.5, b: 1.0, a: 0.5 }, // TRUCK // blue // hex: #0080FF
  5: { r: 1.0, g: 0.5, b: 0.5, a: 0.5 }, // CYCLIST // pink // hex: #FF8080
  6: { r: 1.0, g: 1.0, b: 0.5, a: 0.5 }, // MOTORCYCLE // yellow // hex: #FFFF80
  7: { r: 0.75, g: 1.0, b: 0.25, a: 0.5 }, // PEDESTRIAN // green // hex: #BFFF40
};

enum Classification {
  UNKNOWN = 0,
  CAR = 1,
  BICYCLE = 2,
  BUS = 3,
  TRUCK = 4,
  CYCLIST = 5,
  MOTORCYCLE = 6,
  PEDESTRIAN = 7,
}

function createSceneUpdateMessage(header: Header, spheres: SpherePrimitive[], cubes: CubePrimitive[], lines: LinePrimitive[] = []): SceneUpdate {
  return {
    deletions: [],
    entities: [
      {
        id: spheres.length > 0 ? "predicted_objects" : "detected_objects",
        timestamp: header.stamp,
        frame_id: header.frame_id,
        frame_locked: false,
        lifetime: { sec: 1, nsec: 0 },
        metadata: [],
        arrows: [],
        cylinders: [],
        lines: lines,
        spheres: spheres,
        texts: [],
        triangles: [],
        models: [],
        cubes: cubes,
      },
    ],
  };
}

function createCubePrimitive(position: Point, orientation: Orientation, color: Color, dimensions: Dimensions): CubePrimitive
{
  return {
    color,
    size: { x: dimensions.x, y: dimensions.y, z: dimensions.z },
    pose: {
      position: {
        x: position.x,
        y: position.y,
        // make the cube start at the ground level (z = 0)
        z: position.z - 0.5 * dimensions.z,
      },
      orientation,
    },
  };
}

export function convertDetectedObjects(msg: DetectedObjects): SceneUpdate 
{
  const { header, objects } = msg;

  const cubePrimitives: CubePrimitive[] = objects.reduce((acc: CubePrimitive[], object) => {
    const { kinematics, shape, classification } = object;
    const { pose_with_covariance } = kinematics;
    const { position, orientation } = pose_with_covariance.pose;
    const { dimensions } = shape;

    if (
      classification.length === 0 ||
      !classification[0] ||
      classification[0].label === undefined
    ) {
      return acc;
    }

    const { label } = classification[0];
    const color = colorMap[label as keyof typeof colorMap] ?? { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };

    const predictedObjectCube: CubePrimitive = createCubePrimitive(position, orientation, color, dimensions);

    acc.push(predictedObjectCube);
    return acc;
  }, []);

  return createSceneUpdateMessage(header, [], cubePrimitives, []);
}

export function convertTrackedObjects(msg: TrackedObjects): SceneUpdate 
{
  const { header, objects } = msg;

  const cubePrimitives: CubePrimitive[] = objects.reduce((acc: CubePrimitive[], object) => {
    const { kinematics, shape, classification } = object;
    const { pose_with_covariance } = kinematics;
    const { position, orientation } = pose_with_covariance.pose;
    const { dimensions } = shape;

    if (
      classification.length === 0 ||
      !classification[0] ||
      classification[0].label === undefined
    ) {
      return acc;
    }

    const { label } = classification[0];
    const color = colorMap[label as keyof typeof colorMap] ?? { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };

    const predictedObjectCube: CubePrimitive = createCubePrimitive(position, orientation, color, dimensions);

    acc.push(predictedObjectCube);
    return acc;
  }, []);

  return createSceneUpdateMessage(header, [], cubePrimitives, []);
}

export function convertPredictedObjects(msg: PredictedObjects): SceneUpdate 
{
  const { header, objects } = msg;

  // create lines for predicted paths - dashed line effect
  const linePrimitives: LinePrimitive[] = objects.reduce(
    (acc: LinePrimitive[], object) => {
      const { kinematics, classification } = object;
      const { initial_pose_with_covariance, predicted_paths } = kinematics;

      if (
        classification.length === 0 ||
        !classification[0] ||
        classification[0].label === undefined
      ) {
        return acc;
      }

      const { label } = classification[0];
      const color = colorMap[label as keyof typeof colorMap] ?? { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };

      // if the object is not unknown and has a predicted path, draw the first 3 paths
      if (
        label !== Classification.UNKNOWN &&
        Math.floor(initial_pose_with_covariance.pose.position.x) > 0
      ) {
        // Display first 3 predicted paths as dashed lines (if available)
        const pathsToShow = Math.min(3, predicted_paths.length);
        const alphaValues = [0.7, 0.3, 0.1]; // Transparency for each path
        
        for (let pathIndex = 0; pathIndex < pathsToShow; pathIndex++) {
          const pathPoints = predicted_paths[pathIndex]!.path;
          const pathColor = {
            ...color,
            a: alphaValues[pathIndex]!
          };
          
          // Create line segments: 1-2, 3-4, 5-6, etc. (skip every other connection)
          for (let i = 0; i < pathPoints.length - 1; i += 2) {
            const line: LinePrimitive = {
              type: 0, // LINE_LIST type - individual line segments
              pose: {
                position: { x: 0, y: 0, z: 0 },
                orientation: { x: 0, y: 0, z: 0, w: 1 }
              },
              thickness: 0.1,
              scale_invariant: false,
              color: pathColor,
              colors: [],
              points: [
                pathPoints[i]!.position,
                pathPoints[i + 1]!.position
              ],
              indices: []
            };
            acc.push(line);
          }
        }
      }
      return acc;
    },
    [],
  );

  const cubePrimitives: CubePrimitive[] = objects.reduce((acc: CubePrimitive[], object) => {
    const { kinematics, shape, classification } = object;
    const { initial_pose_with_covariance } = kinematics;
    const { position, orientation } = initial_pose_with_covariance.pose;
    const { dimensions } = shape;

    if (
      classification.length === 0 ||
      !classification[0] ||
      classification[0].label === undefined
    ) {
      return acc;
    }

    const { label } = classification[0];
    const color = colorMap[label as keyof typeof colorMap] ?? { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };

    const predictedObjectCube: CubePrimitive = createCubePrimitive(position, orientation, color, dimensions);

    acc.push(predictedObjectCube);
    return acc;
  }, []);

  return createSceneUpdateMessage(header, [], cubePrimitives, linePrimitives);
}
