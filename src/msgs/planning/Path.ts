// autoware_planning_msgs::msg::Path
import { Header } from "../base/Header";
import { Pose } from "../base/Pose";
import { Point } from "../base/Point";

export type Path = {
  header: Header;
  points: {
    pose: Pose;
    longitudinal_velocity_mps: number;
    lateral_velocity_mps: number;
    heading_rate_rps: number;
    is_final: boolean;
  }[];
  left_bound: Point[];
  right_bound: Point[];
};
