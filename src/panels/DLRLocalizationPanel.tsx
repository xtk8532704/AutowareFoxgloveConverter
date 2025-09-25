import React from "react";
import { PanelExtensionContext } from "@foxglove/studio";
import { createRoot } from "react-dom/client";
import {
  DLRPanelLayout,
  InfoSection,
  InfoGrid,
  getStatusColor,
  DLRResultMsg,
} from "./DLRBasePanel";
import { useEffect, useState, useLayoutEffect } from "react";

// Hook specifically for LocalizationPanel (no condition parsing)
function useLocalizationResult(topicName: string, context: PanelExtensionContext) {
  const [result, setResult] = useState<DLRResultMsg | null>(null);
  const [lastRawMessage, setLastRawMessage] = useState<any>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);

      try {
        if (renderState.currentFrame) {
          for (const msgEvent of renderState.currentFrame) {
            if (msgEvent.topic === topicName) {
              setLastRawMessage(msgEvent.message);

              const jsonString = (msgEvent.message as { data: string }).data;
              const data = JSON.parse(jsonString);

              if (data && data.Result) {
                setResult(data);
                setError(null);
              } else {
                setError("Parsed data but missing Result field");
              }
            }
          }
        }
      } catch (err: any) {
        setError(`Failed to parse result: ${err.message}`);
      }
    };

    context.watch("currentFrame");
    context.subscribe([{ topic: topicName }]);
  }, [context, topicName]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return {
    result,
    lastRawMessage,
    debugMode,
    setDebugMode,
    error,
  };
}

// Info item component with state preservation (specific to LocalizationPanel)
const InfoItem: React.FC<{
  label: string;
  value: string | number | null;
  unit?: string;
  precision?: number;
  preserveState?: boolean;
  statusColor?: boolean;
}> = ({ label, value, unit = "", precision = 3, preserveState = false, statusColor = false }) => {
  const [lastValue, setLastValue] = React.useState<string | number | null>(null);

  React.useEffect(() => {
    if (value !== null && value !== undefined) {
      setLastValue(value);
    }
  }, [value]);

  const displayValue = preserveState
    ? value !== null && value !== undefined
      ? value
      : lastValue
    : value;

  // Determine color based on status
  const getValueColor = () => {
    if (displayValue === null || displayValue === undefined) return "#6c757d";

    if (statusColor) {
      return getStatusColor(String(displayValue));
    }

    return "#495057"; // Default color
  };

  return (
    <div>
      <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "4px" }}>{label}</div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "14px",
          color: getValueColor(),
        }}
      >
        {displayValue !== null && displayValue !== undefined
          ? (typeof displayValue === "number" ? displayValue.toFixed(precision) : displayValue) +
            unit
          : "N/A"}
      </div>
    </div>
  );
};

// Localization Result Panel
function DLRLocalizationPanel({ context }: { context: PanelExtensionContext }): React.JSX.Element {
  const { result, lastRawMessage, debugMode, setDebugMode, error } = useLocalizationResult(
    "/driving_log_replayer/localization/results",
    context
  );

  // Parse vehicle position information
  const getEgoInfo = () => {
    if (!result?.Frame?.Ego) return null;

    const ego = result.Frame.Ego;
    if (ego.TransformStamped && ego.rotation_euler) {
      const transform = ego.TransformStamped.transform;
      const translation = transform.translation;
      const rotation = ego.rotation_euler;

      return {
        position: {
          x: translation.x,
          y: translation.y,
          z: translation.z,
        },
        orientation: {
          roll: rotation.roll,
          pitch: rotation.pitch,
          yaw: rotation.yaw,
        },
        quaternion: transform.rotation,
      };
    }
    return null;
  };

  // Parse convergence information
  const getConvergenceInfo = () => {
    if (!result?.Frame?.Convergence) {
      return {
        lateralDistance: null,
        horizontalDistance: null,
        executionTime: null,
        iterationNum: null,
      };
    }

    const conv = result.Frame.Convergence;
    return {
      lateralDistance: conv.Info?.LateralDistance,
      horizontalDistance: conv.Info?.HorizontalDistance,
      executionTime: conv.Info?.ExeTimeMs,
      iterationNum: conv.Info?.IterationNum,
    };
  };

  const egoInfo = getEgoInfo();
  const convergenceInfo = getConvergenceInfo();

  // Parse summary for additional information
  const parseSummary = (summary: string) => {
    const info: any = {};

    // Parse Convergence: "Convergence (Success): 117 / 117 -> 100.00%"
    const convergenceMatch = summary.match(/Convergence \(([^)]+)\): (\d+) \/ (\d+) -> ([\d.]+)%/);
    if (convergenceMatch) {
      info.convergence = {
        status: convergenceMatch[1],
        passed: parseInt(convergenceMatch[2] || "0"),
        total: parseInt(convergenceMatch[3] || "0"),
        percentage: parseFloat(convergenceMatch[4] || "0"),
      };
    }

    // Parse Reliability: "Reliability (Success): NVTL Sequential NG Count: 0 (Total Test: 118, Average: 2.36558, StdDev: 0.02268)"
    const reliabilityMatch = summary.match(
      /Reliability \(([^)]+)\): NVTL Sequential NG Count: (\d+) \(Total Test: (\d+), Average: ([\d.]+), StdDev: ([\d.]+)\)/
    );
    if (reliabilityMatch) {
      info.reliability = {
        status: reliabilityMatch[1],
        ngCount: parseInt(reliabilityMatch[2] || "0"),
        totalTests: parseInt(reliabilityMatch[3] || "0"),
        average: parseFloat(reliabilityMatch[4] || "0"),
        stdDev: parseFloat(reliabilityMatch[5] || "0"),
      };
    }

    // Parse NDT Status: "NDT Availability (Success): NDT available"
    const ndtMatch = summary.match(/NDT Availability \(([^)]+)\): (.+)/);
    if (ndtMatch) {
      info.ndtStatus = {
        status: ndtMatch[1],
        availability: ndtMatch[2],
      };
    }

    return info;
  };

  const summaryInfo = result?.Result?.Summary ? parseSummary(result.Result.Summary) : {};

  return (
    <DLRPanelLayout
      result={result}
      allConditions={{}}
      currentFrameConditions={new Set()}
      lastRawMessage={lastRawMessage}
      debugMode={debugMode}
      setDebugMode={setDebugMode}
      error={error}
      conditionOrder={[]}
      topicName="/driving_log_replayer/localization/results"
    >
      {/* Vehicle Position & Orientation */}
      {egoInfo && (
        <InfoSection title="Vehicle State">
          <InfoGrid>
            <InfoItem label="Position X" value={egoInfo.position.x} unit="m" precision={3} />
            <InfoItem label="Position Y" value={egoInfo.position.y} unit="m" precision={3} />
            <InfoItem label="Position Z" value={egoInfo.position.z} unit="m" precision={3} />
            <InfoItem
              label="Yaw"
              value={(egoInfo.orientation.yaw * 180) / Math.PI}
              unit="°"
              precision={2}
            />
          </InfoGrid>
        </InfoSection>
      )}

      {/* Convergence Result */}
      <InfoSection title="Convergence Result">
        <InfoGrid>
          <InfoItem
            label="Total Result"
            value={result?.Frame?.Convergence?.Result?.Total || null}
            statusColor={true}
            preserveState={true}
          />
          <InfoItem
            label="Frame Result"
            value={result?.Frame?.Convergence?.Result?.Frame || null}
            statusColor={true}
            preserveState={true}
          />
          <InfoItem
            label="Passed/Total"
            value={
              summaryInfo.convergence
                ? `${summaryInfo.convergence.passed}/${summaryInfo.convergence.total}`
                : null
            }
            preserveState={true}
          />
          <InfoItem
            label="Percentage"
            value={summaryInfo.convergence?.percentage}
            unit="%"
            precision={2}
            preserveState={true}
          />
          <InfoItem
            label="Lateral Error"
            value={convergenceInfo.lateralDistance}
            unit="m"
            precision={4}
            preserveState={true}
          />
          <InfoItem
            label="Horizontal Error"
            value={convergenceInfo.horizontalDistance}
            unit="m"
            precision={4}
            preserveState={true}
          />
          <InfoItem
            label="Execution Time"
            value={convergenceInfo.executionTime}
            unit="ms"
            precision={2}
            preserveState={true}
          />
          <InfoItem
            label="Iterations"
            value={convergenceInfo.iterationNum}
            precision={0}
            preserveState={true}
          />
        </InfoGrid>
      </InfoSection>

      {/* Reliability Result */}
      <InfoSection title="Reliability Result">
        <InfoGrid>
          <InfoItem
            label="Total Result"
            value={result?.Frame?.Reliability?.Result?.Total || null}
            statusColor={true}
            preserveState={true}
          />
          <InfoItem
            label="Frame Result"
            value={result?.Frame?.Reliability?.Result?.Frame || null}
            statusColor={true}
            preserveState={true}
          />
          <InfoItem
            label="NG/Total"
            value={
              summaryInfo.reliability
                ? `${summaryInfo.reliability.ngCount}/${summaryInfo.reliability.totalTests}`
                : null
            }
            preserveState={true}
          />
          <InfoItem
            label="Average"
            value={summaryInfo.reliability?.average}
            precision={5}
            preserveState={true}
          />
          <InfoItem
            label="Std Dev"
            value={summaryInfo.reliability?.stdDev}
            precision={5}
            preserveState={true}
          />
        </InfoGrid>
      </InfoSection>

      {/* NDT Status */}
      <InfoSection title="NDT Status">
        <InfoGrid>
          <InfoItem
            label="Total Result"
            value={result?.Frame?.Availability?.Result?.Total || null}
            statusColor={true}
            preserveState={true}
          />
          <InfoItem
            label="Frame Result"
            value={result?.Frame?.Availability?.Result?.Frame || null}
            statusColor={true}
            preserveState={true}
          />
        </InfoGrid>
      </InfoSection>
    </DLRPanelLayout>
  );
}

// Export function
export function initDLRLocalizationPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<DLRLocalizationPanel context={context} />);
  return () => {
    root.unmount();
  };
}
