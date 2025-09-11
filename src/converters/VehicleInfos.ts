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

class VehicleConfigManager {
    private static instance: VehicleConfigManager;
    private currentConfig: VehicleInfo;

    private constructor() {
        this.currentConfig = VEHICLE_INFOS[2]!;
    }

    public static getInstance(): VehicleConfigManager {
        if (!VehicleConfigManager.instance) {
            VehicleConfigManager.instance = new VehicleConfigManager();
        }
        return VehicleConfigManager.instance;
    }

    public setVehicleConfigByName(vehicleName: string): void {
        const config = VEHICLE_INFOS.find(v => v.name === vehicleName);
        if (config) {
            this.currentConfig = config;
        } else {
            console.warn(`VehicleConfigManager: Vehicle name "${vehicleName}" not found. Keeping previous configuration.`);
        }
    }
    public setVehicleConfig(vehicleInfo: VehicleInfo): void {
        this.currentConfig = vehicleInfo;
    }

    public getCurrentVehicleConfig(): VehicleInfo {
        return this.currentConfig;
    }
}

export function setVehicleConfigByName(vehicleName: string): void {
    VehicleConfigManager.getInstance().setVehicleConfigByName(vehicleName);
}

export function setVehicleConfig(vehicleInfo: VehicleInfo): void {
    VehicleConfigManager.getInstance().setVehicleConfig(vehicleInfo);
}

export function getCurrentVehicleConfig(): VehicleInfo {
    return VehicleConfigManager.getInstance().getCurrentVehicleConfig();
}