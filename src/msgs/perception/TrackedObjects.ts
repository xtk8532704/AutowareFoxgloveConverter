// autoware_perception_msgs::msg::TrackedObjects
import { Header } from "../base/Header";
import { ClassificationLabel } from "../perception/ClassificationLabel";
import { Point2D } from "../base/Point";
import { Pose } from "../base/Pose";
import { Twist } from "../base/Twist";
import { Dimensions } from "../base/Dimensions";

export type TrackedObjects = {
  header: Header;
  objects: {
    object_id: {
      uuid: Uint8Array;
    };
    existence_probability: number;
    classification: ClassificationLabel[];
    kinematics: {
      pose_with_covariance: {
        pose: Pose;
        covariance: Float64Array;
      };
      orientation_probability: number;
      twist_with_covariance: {
        twist: Twist;
        covariance: Float64Array;
      };
      acceleration_with_covariance: {
        accel: Twist;
        covariance: Float64Array;
      };
      is_stationary: boolean;
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
