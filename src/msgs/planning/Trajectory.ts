// autoware_planning_msgs::msg::Trajectory
import { Header } from "../base/Header";
import { Time } from "@foxglove/schemas";
import { Pose } from "../base/Pose";

export type Trajectory = {
  header: Header;
  points: {
    time_from_start: Time;
    pose: Pose;
    longitudinal_velocity_mps: number;
    lateral_velocity_mps: number;
    acceleration_mps2: number;
    heading_rate_rps: number;
    front_wheel_angle_rad: number;
    rear_wheel_angle_rad: number;
  }[];
};
