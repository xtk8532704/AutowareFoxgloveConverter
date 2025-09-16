// PanelSettings is no longer needed in this file

export interface VehicleInfo {
    name: string;
    wheel_base: number;
    wheel_tread: number;
    front_overhang: number;
    rear_overhang: number;
    left_overhang: number;
    right_overhang: number;
    vehicle_height: number;
}

export interface VehicleConfig {
    selectedVehicle: string;
}

export const VEHICLE_INFOS: VehicleInfo[] = [
    {
        name: "lexus",
        wheel_base: 2.79,
        wheel_tread: 1.64,
        front_overhang: 1.0,
        rear_overhang: 1.1,
        left_overhang: 0.128,
        right_overhang: 0.128,
        vehicle_height: 2.5,
    },
    {
        name: "taxi",
        wheel_base: 2.75,
        wheel_tread: 1.485,
        front_overhang: 0.8,
        rear_overhang: 0.85,
        left_overhang: 0.105,
        right_overhang: 0.105,
        vehicle_height: 2.5,
    },
    {
        name: "medium_bus",
        wheel_base: 4.76,
        wheel_tread: 1.754,
        front_overhang: 0.9154,
        rear_overhang: 1.498,
        left_overhang: 0.273,
        right_overhang: 0.273,
        vehicle_height: 3.06,
    },
    {
        name: "large_bus",
        wheel_base: 5.3,
        wheel_tread: 2.065,
        front_overhang: 2.8,
        rear_overhang: 2.83,
        left_overhang: 0.25,
        right_overhang: 0.25,
        vehicle_height: 3.1,
    },
    {
        name: "cargo_transport",
        wheel_base: 1.335,
        wheel_tread: 0.955,
        front_overhang: 0.53,
        rear_overhang: 0.375,
        left_overhang: 0.0725,
        right_overhang: 0.0725,
        vehicle_height: 1.87,
    }
];

// VehicleInfoSettings is now managed by VehicleInfoPanel.tsx
// This file only contains the vehicle data definitions
