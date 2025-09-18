import React from "react";
import { PanelExtensionContext } from "@foxglove/studio";
import { useEffect, useState, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";

interface DLRResultMsg {
  Result: {
    Success: boolean;
    Summary: string;
  };
  Stamp: {
    System: number;
    ROS: number;
  };
  Frame: {
    [key: string]: {
      Result: {
        Total: string;
        Frame: string;
      };
      Info: any;
    };
  };
}

const getStatusColor = (status: boolean | string) => {
  if (typeof status === "boolean") {
    return status ? "#28a745" : "#dc3545";
  }
  const lower = status.toLowerCase();
  if (lower === "success" || lower === "ok") return "#28a745";
  if (lower === "failure" || lower === "error" || lower === "fail") return "#dc3545";
  if (lower === "warn" || lower === "warning") return "#ffc107";
  return "#6c757d";
};

const parseConditionNames = (summary: string): string[] => {
  const summaryText = summary.replace(/^(Failed:|Passed:)/, "");
  const conditionMatches = summaryText.match(/([^,]+?)\s*\([^)]+\)/g);
  
  if (conditionMatches) {
    return conditionMatches.map((match: string) => 
      match.replace(/\s*\([^)]+\)$/, '').trim()
    );
  }
  return [];
};

// Hook for DLRResultPanel
function useDLRResult(topicName: string, context: PanelExtensionContext) {
  const [result, setResult] = useState<DLRResultMsg | null>(null);
  const [allConditions, setAllConditions] = useState<{ [key: string]: any }>({});
  const [currentFrameConditions, setCurrentFrameConditions] = useState<Set<string>>(new Set());
  const [lastRawMessage, setLastRawMessage] = useState<any>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [conditionOrder, setConditionOrder] = useState<string[]>([]);

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

                if (conditionOrder.length === 0 && data.Result.Summary) {
                  const conditionNames = parseConditionNames(data.Result.Summary);
                  if (conditionNames.length > 0) {
                    setConditionOrder(conditionNames);
                  }
                }

                if (data.Frame) {
                  setAllConditions(prev => ({
                    ...prev,
                    ...data.Frame,
                  }));
                  setCurrentFrameConditions(new Set(Object.keys(data.Frame)));
                } else {
                  setCurrentFrameConditions(new Set());
                }

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
    allConditions,
    currentFrameConditions,
    lastRawMessage,
    debugMode,
    setDebugMode,
    error,
    conditionOrder,
  };
}

// Condition display component
const ConditionDisplay: React.FC<{
  conditionName: string;
  details: any;
  isCurrentFrame: boolean;
}> = ({ conditionName, details, isCurrentFrame }) => (
  <div
    style={{
      padding: "16px",
      backgroundColor: isCurrentFrame ? "#f8f9fa" : "#f1f3f4",
      borderRadius: "8px",
      border: "1px solid #e9ecef",
      opacity: isCurrentFrame ? 1 : 0.7,
    }}
  >
    <div
      style={{
        fontWeight: "bold",
        fontSize: "16px",
        marginBottom: "12px",
        color: isCurrentFrame ? "#495057" : "#6c757d",
      }}
    >
      {conditionName}
    </div>

    {details ? (
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "12px",
        }}
      >
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "12px", color: "#6c757d" }}>Total Result: </span>
          <span
            style={{
              fontWeight: "bold",
              color: getStatusColor(details.Result.Total),
            }}
          >
            {details.Result.Total}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "12px", color: "#6c757d" }}>Frame Result: </span>
          <span
            style={{
              fontWeight: "bold",
              color: getStatusColor(details.Result.Frame),
            }}
          >
            {details.Result.Frame}
          </span>
        </div>
      </div>
    ) : (
      <div
        style={{
          padding: "12px",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "6px",
          marginBottom: "12px",
          fontSize: "13px",
          color: "#856404",
        }}
      >
        <strong>Note:</strong> There is no details for this condition, possibly due to the relevant topic not publishing any information.
      </div>
    )}

    {/* Condition Info */}
    {details && details.Info && Object.keys(details.Info).length > 0 ? (
      <div style={{ fontSize: "13px", color: "#495057" }}>
        {Object.entries(details.Info).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "4px" }}>
            <span style={{ fontWeight: "500", color: "#6c757d" }}>{key}:</span>{" "}
            {String(value)}
          </div>
        ))}
      </div>
    ) : details ? (
      <div style={{ fontSize: "13px", color: "#6c757d", fontStyle: "italic" }}>
        No additional info available
      </div>
    ) : null}
  </div>
);

// Diagnostics Panel
function DLRDiagnosticsPanel({ context }: { context: PanelExtensionContext }): React.JSX.Element {
  const {
    result,
    allConditions,
    currentFrameConditions,
    lastRawMessage,
    debugMode,
    setDebugMode,
    error,
    conditionOrder,
  } = useDLRResult("/driving_log_replayer/diagnostics/results", context);

  return (
    <div
      style={{
        padding: "16px",
        fontFamily: "system-ui",
        height: "100%",
        overflow: "auto",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Error Display */}
      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "20px",
            color: "#721c24",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Debug Mode Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <div style={{ fontSize: "12px", color: "#6c757d", fontFamily: "monospace" }}>
          Status: {result ? "Data received" : "Waiting for data..."}
        </div>
        <button
          onClick={() => setDebugMode(!debugMode)}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #6c757d",
            backgroundColor: debugMode ? "#6c757d" : "white",
            color: debugMode ? "white" : "#6c757d",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          {debugMode ? "Hide Debug" : "Show Debug"}
        </button>
      </div>

      {/* Debug Display */}
      {debugMode && (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e9ecef",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "20px",
            fontSize: "12px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "#495057",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "6px", fontFamily: "system-ui", color: "#6c757d" }}>
            Raw Message JSON:
          </div>
          {lastRawMessage ? (
            <pre style={{ margin: 0 }}>{JSON.stringify(lastRawMessage, null, 2)}</pre>
          ) : (
            <div style={{ fontStyle: "italic", color: "#adb5bd" }}>No message received yet...</div>
          )}
        </div>
      )}

      {result ? (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {/* Overall Status */}
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              marginBottom: "24px",
              backgroundColor: getStatusColor(result.Result.Success) + "15",
              borderRadius: "8px",
              border: `3px solid ${getStatusColor(result.Result.Success)}`,
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "24px",
                color: getStatusColor(result.Result.Success),
              }}
            >
              {result.Result.Success ? "SUCCESS" : "FAILURE"}
            </div>
          </div>

          {/* Condition History */}
          <div style={{ display: "grid", gap: "12px" }}>
            {(conditionOrder.length > 0
              ? conditionOrder.map(name => [name, allConditions[name] || null])
              : Object.entries(allConditions)
            ).map(([conditionName, details]) => {
              const isCurrentFrame = currentFrameConditions.has(conditionName);
              return (
                <ConditionDisplay
                  key={conditionName}
                  conditionName={conditionName}
                  details={details}
                  isCurrentFrame={isCurrentFrame}
                />
              );
            })}
          </div>

          {/* Timestamps */}
          <div
            style={{
              fontSize: "12px",
              color: "#6c757d",
              borderTop: "1px solid #e9ecef",
              paddingTop: "12px",
              marginTop: "20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            <div>
              <strong>System Timestamp:</strong>
              <br />
              {result.Stamp.System.toFixed(6)}s
            </div>
            <div>
              <strong>ROS Timestamp:</strong>
              <br />
              {result.Stamp.ROS.toFixed(6)}s
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "40px",
            textAlign: "center",
            color: "#6c757d",
            fontStyle: "italic",
          }}
        >
          <div>Waiting for data...</div>
          <div style={{ fontSize: "12px", marginTop: "8px" }}>
            Listening to: /driving_log_replayer/diagnostics/results
          </div>
        </div>
      )}
    </div>
  );
}

// Planning Factor Panel
function DLRPlanningFactorPanel({ context }: { context: PanelExtensionContext }): React.JSX.Element {
  const {
    result,
    allConditions,
    currentFrameConditions,
    lastRawMessage,
    debugMode,
    setDebugMode,
    error,
    conditionOrder,
  } = useDLRResult("/driving_log_replayer/planning_factor/results", context);

  return (
    <div
      style={{
        padding: "16px",
        fontFamily: "system-ui",
        height: "100%",
        overflow: "auto",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Error Display */}
      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "20px",
            color: "#721c24",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Debug Mode Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <div style={{ fontSize: "12px", color: "#6c757d", fontFamily: "monospace" }}>
          Status: {result ? "Data received" : "Waiting for data..."}
        </div>
        <button
          onClick={() => setDebugMode(!debugMode)}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #6c757d",
            backgroundColor: debugMode ? "#6c757d" : "white",
            color: debugMode ? "white" : "#6c757d",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          {debugMode ? "Hide Debug" : "Show Debug"}
        </button>
      </div>

      {/* Debug Display */}
      {debugMode && (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e9ecef",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "20px",
            fontSize: "12px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "#495057",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "6px", fontFamily: "system-ui", color: "#6c757d" }}>
            Raw Message JSON:
          </div>
          {lastRawMessage ? (
            <pre style={{ margin: 0 }}>{JSON.stringify(lastRawMessage, null, 2)}</pre>
          ) : (
            <div style={{ fontStyle: "italic", color: "#adb5bd" }}>No message received yet...</div>
          )}
        </div>
      )}

      {result ? (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {/* Overall Status */}
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              marginBottom: "24px",
              backgroundColor: getStatusColor(result.Result.Success) + "15",
              borderRadius: "8px",
              border: `3px solid ${getStatusColor(result.Result.Success)}`,
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "24px",
                color: getStatusColor(result.Result.Success),
              }}
            >
              {result.Result.Success ? "SUCCESS" : "FAILURE"}
            </div>
          </div>

          {/* Condition History */}
          <div style={{ display: "grid", gap: "12px" }}>
            {(conditionOrder.length > 0
              ? conditionOrder.map(name => [name, allConditions[name] || null])
              : Object.entries(allConditions)
            ).map(([conditionName, details]) => {
              const isCurrentFrame = currentFrameConditions.has(conditionName);
              return (
                <ConditionDisplay
                  key={conditionName}
                  conditionName={conditionName}
                  details={details}
                  isCurrentFrame={isCurrentFrame}
                />
              );
            })}
          </div>

          {/* Timestamps */}
          <div
            style={{
              fontSize: "12px",
              color: "#6c757d",
              borderTop: "1px solid #e9ecef",
              paddingTop: "12px",
              marginTop: "20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            <div>
              <strong>System Timestamp:</strong>
              <br />
              {result.Stamp.System.toFixed(6)}s
            </div>
            <div>
              <strong>ROS Timestamp:</strong>
              <br />
              {result.Stamp.ROS.toFixed(6)}s
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "40px",
            textAlign: "center",
            color: "#6c757d",
            fontStyle: "italic",
          }}
        >
          <div>Waiting for data...</div>
          <div style={{ fontSize: "12px", marginTop: "8px" }}>
            Listening to: /driving_log_replayer/planning_factor/results
          </div>
        </div>
      )}
    </div>
  );
}

// Export functions
export function initDLRDiagnosticsPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<DLRDiagnosticsPanel context={context} />);
  return () => {
    root.unmount();
  };
}

export function initDLRPlanningFactorPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<DLRPlanningFactorPanel context={context} />);
  return () => {
    root.unmount();
  };
}