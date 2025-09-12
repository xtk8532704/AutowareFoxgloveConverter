import { PanelExtensionContext } from "@foxglove/studio";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { VEHICLE_INFOS, VehicleInfo, setVehicleConfig, getCurrentVehicleConfig } from "../converters/VehicleInfos";

function VehicleConfigPanel({ context }: { context: PanelExtensionContext }): JSX.Element {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleInfo>(getCurrentVehicleConfig());
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  useEffect(() => {
    context.onRender = (_, done) => {
      setRenderDone(() => done);
    };
  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  useEffect(() => {
    setVehicleConfig(selectedVehicle);
  }, [selectedVehicle]);

  const handleVehicleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleName = event.target.value;
    const vehicle = VEHICLE_INFOS.find(v => v.name === vehicleName);
    if (vehicle) {
      setSelectedVehicle(vehicle);
    }
  };

  const totalLength = selectedVehicle.front_overhang + selectedVehicle.wheel_base + selectedVehicle.rear_overhang;
  const totalWidth = selectedVehicle.wheel_tread + selectedVehicle.left_overhang + selectedVehicle.right_overhang;

  return (
    <div style={{ padding: "16px", fontFamily: "system-ui" }}>
      <select 
        value={selectedVehicle.name} 
        onChange={handleVehicleChange}
        style={{ 
          width: "100%", 
          padding: "8px",
          marginBottom: "16px",
          fontSize: "14px"
        }}
      >
        {VEHICLE_INFOS.map(vehicle => (
          <option key={vehicle.name} value={vehicle.name}>
            {vehicle.name}
          </option>
        ))}
      </select>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "8px", 
        fontSize: "13px",
        marginBottom: "16px"
      }}>
        <div>wheel_base: {selectedVehicle.wheel_base}m</div>
        <div>wheel_tread: {selectedVehicle.wheel_tread}m</div>
        <div>front_overhang: {selectedVehicle.front_overhang}m</div>
        <div>rear_overhang: {selectedVehicle.rear_overhang}m</div>
        <div>left_overhang: {selectedVehicle.left_overhang}m</div>
        <div>right_overhang: {selectedVehicle.right_overhang}m</div>
      </div>

      <div style={{ 
        padding: "12px", 
        backgroundColor: "#f5f5f5", 
        borderRadius: "4px",
        fontSize: "13px"
      }}>
        <div><strong>Total:</strong> {totalLength.toFixed(2)}m × {totalWidth.toFixed(2)}m × {selectedVehicle.vehicle_height}m</div>
      </div>
    </div>
  );
}

export function initVehicleConfigPanel(context: PanelExtensionContext): () => void {
  ReactDOM.render(<VehicleConfigPanel context={context} />, context.panelElement);
  return () => {
    ReactDOM.unmountComponentAtNode(context.panelElement);
  };
}