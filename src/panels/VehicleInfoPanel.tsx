import React, { useState, useEffect } from 'react';
import { PanelExtensionContext } from "@foxglove/studio";
import { createRoot } from "react-dom/client";
import { VehicleInfo, VEHICLE_INFOS } from '../config/VehicleInfos';

// Vehicle information management singleton class
class VehicleInfoManager {
  private static instance: VehicleInfoManager;
  private currentVehicle: VehicleInfo;
  private listeners: ((vehicle: VehicleInfo) => void)[] = [];

  private constructor() {
    this.currentVehicle = VEHICLE_INFOS[0]!; // Default to first vehicle
  }

  public static getInstance(): VehicleInfoManager {
    if (!VehicleInfoManager.instance) {
      VehicleInfoManager.instance = new VehicleInfoManager();
    }
    return VehicleInfoManager.instance;
  }

  // Get current vehicle information
  public getCurrentVehicle(): VehicleInfo {
    return this.currentVehicle;
  }

  // Set vehicle type
  public setVehicleType(vehicleName: string): void {
    const vehicle = VEHICLE_INFOS.find(v => v.name === vehicleName);
    if (vehicle) {
      this.currentVehicle = vehicle;
      this.notifyListeners();
    }
  }

  // Add listener
  public addListener(listener: (vehicle: VehicleInfo) => void): void {
    this.listeners.push(listener);
  }

  // Remove listener
  public removeListener(listener: (vehicle: VehicleInfo) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentVehicle));
  }

  // Calculate vehicle dimensions
  public getVehicleDimensions(): {
    length: number;
    width: number;
    height: number;
    wheelBase: number;
    wheelTread: number;
  } {
    const v = this.currentVehicle;
    return {
      length: v.wheel_base + v.front_overhang + v.rear_overhang,
      width: v.wheel_tread + v.left_overhang + v.right_overhang,
      height: v.vehicle_height,
      wheelBase: v.wheel_base,
      wheelTread: v.wheel_tread
    };
  }

  // Calculate offsets
  public getOffsets(): {
    frontOverhang: number;
    rearOverhang: number;
    leftOverhang: number;
    rightOverhang: number;
  } {
    const v = this.currentVehicle;
    return {
      frontOverhang: v.front_overhang,
      rearOverhang: v.rear_overhang,
      leftOverhang: v.left_overhang,
      rightOverhang: v.right_overhang
    };
  }
}

// Export singleton instance
export const vehicleInfoManager = VehicleInfoManager.getInstance();

// Vehicle information panel component
export const VehicleInfoPanel: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicleInfoManager.getCurrentVehicle().name);
  const [currentVehicle, setCurrentVehicle] = useState<VehicleInfo>(vehicleInfoManager.getCurrentVehicle());

  useEffect(() => {
    const handleVehicleChange = (vehicle: VehicleInfo) => {
      setCurrentVehicle(vehicle);
      setSelectedVehicle(vehicle.name);
    };

    vehicleInfoManager.addListener(handleVehicleChange);
    return () => vehicleInfoManager.removeListener(handleVehicleChange);
  }, []);

  const handleVehicleChange = (vehicleName: string) => {
    vehicleInfoManager.setVehicleType(vehicleName);
  };

  const dimensions = vehicleInfoManager.getVehicleDimensions();

  return (
    <div style={{ padding: '16px', fontFamily: 'Arial, sans-serif' }}>
      {/* Vehicle type selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Vehicle Type:
        </label>
        <select
          value={selectedVehicle}
          onChange={(e) => handleVehicleChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          {VEHICLE_INFOS.map(vehicle => (
            <option key={vehicle.name} value={vehicle.name}>
              {vehicle.name}
            </option>
          ))}
        </select>
      </div>

      {/* Vehicle dimensions */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '12px', color: '#555' }}>Dimensions</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
          <div><strong>Length:</strong> {dimensions.length.toFixed(3)} m</div>
          <div><strong>Width:</strong> {dimensions.width.toFixed(3)} m</div>
          <div><strong>Height:</strong> {dimensions.height.toFixed(3)} m</div>
        </div>
      </div>

      {/* Raw parameters */}
      <div>
        <h4 style={{ marginBottom: '12px', color: '#555' }}>Raw Parameters</h4>
        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
          <div><strong>wheel_base:</strong> {currentVehicle.wheel_base.toFixed(3)} m</div>
          <div><strong>wheel_tread:</strong> {currentVehicle.wheel_tread.toFixed(3)} m</div>
          <div><strong>front_overhang:</strong> {currentVehicle.front_overhang.toFixed(3)} m</div>
          <div><strong>rear_overhang:</strong> {currentVehicle.rear_overhang.toFixed(3)} m</div>
          <div><strong>left_overhang:</strong> {currentVehicle.left_overhang.toFixed(3)} m</div>
          <div><strong>right_overhang:</strong> {currentVehicle.right_overhang.toFixed(3)} m</div>
          <div><strong>vehicle_height:</strong> {currentVehicle.vehicle_height.toFixed(3)} m</div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInfoPanel;

// Initialization function for panel registration
export function initVehicleInfoPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<VehicleInfoPanel />);
  return () => {
    root.unmount();
  };
}
