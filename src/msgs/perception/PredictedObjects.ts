// autoware_perception_msgs::msg::PredictedObjects
import { Header } from "../base/Header";
import { ClassificationLabel } from "../perception/ClassificationLabel";
import { Point2D } from "../base/Point";
import { Pose } from "../base/Pose";
import { Twist } from "../base/Twist";
import { Time } from "@foxglove/schemas";
import { Dimensions } from "../base/Dimensions";

export type PredictedObjects = {
  header: Header;
  objects: {
    object_id: {
      uuid: Uint8Array;
    };
    existence_probability: number;
    classification: ClassificationLabel[];
    kinematics: {
      initial_pose_with_covariance: {
        pose: Pose;
        covariance: Float64Array;
      };
      initial_twist_with_covariance: {
        twist: Twist;
        covariance: Float64Array;
      };
      initial_acceleration_with_covariance: {
        accel: Twist;
        covariance: Float64Array;
      };
      predicted_paths: {
        path: Pose[];
        time_step: Time;
        confidence: number;
      }[];
    };
    shape: {
      type: number;
      footprint: {
        points: Point2D[];
      };
      dimensions: Dimensions;
    };
  }[];
};
