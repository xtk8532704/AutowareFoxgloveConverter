import { Header } from "../base/Header";
import { Pose } from "../base/Pose";
import { Twist } from "../base/Twist";

export type Odometry = {
    header: Header;
    child_frame_id: string;
    pose: {
        pose: Pose;
        covariance: Float64Array;
    };
    twist: {
        twist: Twist;
        covariance: Float64Array;
    };
};
