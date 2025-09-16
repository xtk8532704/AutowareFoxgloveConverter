// autoware_internal_planning_msgs::msg::PathWithLaneId
import { Header } from "../base/Header";
import { Pose } from "../base/Pose";
import { Point } from "../base/Point";

export type PathWithLaneId = {
  header: Header;
  points: {
    point: {
      pose: Pose;
      longitudinal_velocity_mps: number;
      lateral_velocity_mps: number;
      heading_rate_rps: number;
      is_final: boolean;
    };
    lane_ids: number[];
  }[];
  left_bound: Point[];
  right_bound: Point[];
};
