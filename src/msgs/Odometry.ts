import { Header } from "./Header";
import { Point } from "./Point";
import { Orientation } from "./Orientation";

export type Odometry = {
    header: Header;
    child_frame_id: string;
    pose: {
        pose: {
            position: Point;
            orientation: Orientation;
        };
        covariance: Float64Array;
    };
    twist: {
        twist: {
            linear: {
                x: number;
                y: number;
                z: number;
            };
            angular: {
                x: number;
                y: number;
                z: number;
            };
        };
        covariance: Float64Array;
    };
};
