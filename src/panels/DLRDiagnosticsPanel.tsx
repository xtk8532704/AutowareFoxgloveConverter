// Topic: /driving_log_replayer/diagnostics_results
// {"Result": {"Success": false, "Summary": "Failed:Condition_0 (Fail), Condition_1 (Success), Condition_2 (Success), Condition_3 (Success), Condition_4 (Success), Condition_5 (Success), Condition_6 (Success), Condition_7 (Success), Condition_8 (Success), Condition_9 (Success), Condition_10 (Success), Condition_11 (Success), Condition_12 (Success), Condition_13 (Success), Condition_14 (Success)"}, "Stamp": {"System": 1755507663.0284886, "ROS": 1690176168.120652}, "Frame": {"Condition_1": {"Result": {"Total": "Success", "Frame": "Success"}, "Info": {"TotalPassed": 3, "Level": "OK"}}}}
// {"Result": {"Success": true, "Summary": "Passed:Condition_0 (Success), Condition_1 (Success), Condition_2 (Success), Condition_3 (Success), Condition_4 (Success), Condition_5 (Success), Condition_6 (Success), Condition_7 (Success), Condition_8 (Success), Condition_9 (Success), Condition_10 (Success), Condition_11 (Success), Condition_12 (Success), Condition_13 (Success), Condition_14 (Success)"}, "Stamp": {"System": 1755507663.0401201, "ROS": 1690176168.1356387}, "Frame": {"Condition_0": {"Result": {"Total": "Success", "Frame": "Success"}, "Info": {"TotalPassed": 1, "Level": "WARN"}}}}

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

function DLRDiagnosticsResultPanel({ context }: { context: PanelExtensionContext }): JSX.Element {
  const TopicName = "/driving_log_replayer/diagnostics_results";
  const [result, setResult] = useState<DLRResultMsg | null>(null);
  const [allConditions, setAllConditions] = useState<{[key: string]: any}>({});
  const [currentFrameConditions, setCurrentFrameConditions] = useState<Set<string>>(new Set());
  const [lastRawMessage, setLastRawMessage] = useState<any>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [conditionOrder, setConditionOrder] = useState<string[]>([]); // 新增


  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);

      console.log("RenderState:", renderState);
      
      try {
        if (renderState.currentFrame) {
          for (const msgEvent of renderState.currentFrame) {
            if (msgEvent.topic === TopicName) {
              setLastRawMessage(msgEvent.message);

              const jsonString = (msgEvent.message as { data: string }).data;
              const data = JSON.parse(jsonString);

              if (data && data.Result) {
                console.log("Successfully parsed data:", data);
                setResult(data);

                if (conditionOrder.length === 0 && data.Result.Summary) {
                  const summaryText = data.Result.Summary.replace(/^(Failed:|Passed:)/, '');
                  const conditionMatches = summaryText.match(/Condition_\d+/g);
                  if (conditionMatches) {
                    setConditionOrder(conditionMatches);
                  }
                }

                if (data.Frame) {
                  setAllConditions(prev => ({
                    ...prev,
                    ...data.Frame
                  }));
                  setCurrentFrameConditions(new Set(Object.keys(data.Frame)));
                }
                else {
                  setCurrentFrameConditions(new Set());
                }
                
                setError(null);
              } else {
                const errorMsg = "Parsed data but missing Result field";
                console.error(errorMsg, data);
                setError(errorMsg);
              }
            }
          }
        }
      } catch (err: any) {
        const errorMessage = `Failed to parse diagnostics result: ${err.message}`;
        console.error(errorMessage, err);
        console.error("Raw message structure:", lastRawMessage);
        setError(errorMessage);
      }
    };

    context.watch("currentFrame");
  
    context.subscribe([{ topic: TopicName }]);
    
    console.log(`Subscribed to ${TopicName}`);
  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

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

  return (
    <div style={{ padding: "16px", fontFamily: "system-ui", height: "100%", overflow: "auto", backgroundColor: "#f8f9fa" }}>
      <h2 style={{ margin: "0 0 20px 0", color: "#343a40" }}>DLR Diagnostics Result</h2>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "20px",
          color: "#721c24"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Debug Mode Toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <button
          onClick={() => setDebugMode(!debugMode)}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #6c757d",
            backgroundColor: debugMode ? "#6c757d" : "white",
            color: debugMode ? "white" : "#6c757d",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          {debugMode ? "Hide Debug" : "Show Debug"}
        </button>
      </div>

      {/* Debug Mode Content */}
      {debugMode && (
        <div style={{
          backgroundColor: "#fff",
          border: "1px solid #e9ecef",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "20px",
          fontSize: "12px",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: "#495057"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "6px", fontFamily: "system-ui", color: "#6c757d" }}>
            Raw Message JSON:
          </div>
          {lastRawMessage ? (
            <pre style={{ margin: 0 }}>
              {JSON.stringify(lastRawMessage, null, 2)}
            </pre>
          ) : (
            <div style={{ fontStyle: "italic", color: "#adb5bd" }}>
              No message received yet...
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "10px", fontFamily: "monospace" }}>
        Status: {result ? "Data received" : "Waiting for data..."}
      </div>

      {result ? (
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {/* Overall Status */}
          <div style={{
            textAlign: "center",
            padding: "20px",
            marginBottom: "24px",
            backgroundColor: getStatusColor(result.Result.Success) + "15",
            borderRadius: "8px",
            border: `3px solid ${getStatusColor(result.Result.Success)}`
          }}>
            <div style={{ 
              fontWeight: "bold", 
              fontSize: "24px", 
              color: getStatusColor(result.Result.Success)
            }}>
              {result.Result.Success ? "SUCCESS" : "FAILURE"}
            </div>
          </div>

          {/* Condition History */}
          <div style={{ display: "grid", gap: "12px" }}>
            {(conditionOrder.length > 0 
              ? conditionOrder.filter(name => allConditions[name]).map(name => [name, allConditions[name]])
              : Object.entries(allConditions)
            ).map(([conditionName, details]) => {
              const isCurrentFrame = currentFrameConditions.has(conditionName);
              return (
                <div key={conditionName} style={{
                  padding: "16px",
                  backgroundColor: isCurrentFrame ? "#f8f9fa" : "#f1f3f4",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                  opacity: isCurrentFrame ? 1 : 0.7
                }}>
                  <div style={{ 
                    fontWeight: "bold", 
                    fontSize: "16px", 
                    marginBottom: "12px", 
                    color: isCurrentFrame ? "#495057" : "#6c757d"
                  }}>
                    {conditionName}
                  </div>

                  <div style={{
                    display: "flex", 
                    gap: "16px",
                    marginBottom: "12px"
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "12px", color: "#6c757d" }}>Total Result: </span>
                      <span style={{ 
                        fontWeight: "bold", 
                        color: getStatusColor(details.Result.Total)
                      }}>
                        {details.Result.Total}
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "12px", color: "#6c757d" }}>Frame Result: </span>
                      <span style={{ 
                        fontWeight: "bold", 
                        color: getStatusColor(details.Result.Frame)
                      }}>
                        {details.Result.Frame}
                      </span>
                    </div>
                  </div>

                  {/* Condition Info */}
                  {details.Info && (
                    <div style={{ fontSize: "13px", color: "#495057" }}>
                      {Object.entries(details.Info).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: "4px" }}>
                          <span style={{ fontWeight: "500", color: "#6c757d" }}>{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Timestamps */}
          <div style={{
            fontSize: "12px", color: "#6c757d", borderTop: "1px solid #e9ecef",
            paddingTop: "12px", marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px"
          }}>
            <div>
              <strong>System Timestamp:</strong><br />
              {result.Stamp.System.toFixed(6)}s
            </div>
            <div>
              <strong>ROS Timestamp:</strong><br />
              {result.Stamp.ROS.toFixed(6)}s
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: "white", borderRadius: "8px", padding: "40px",
          textAlign: "center", color: "#6c757d", fontStyle: "italic"
        }}>
          <div>Waiting for diagnostics data...</div>
          <div style={{ fontSize: "12px", marginTop: "8px" }}>
            Listening to: /driving_log_replayer/diagnostics_result
          </div>
        </div>
      )}
    </div>
  );
}

export function initDLRDiagnosticsResultPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<DLRDiagnosticsResultPanel context={context} />);
  return () => {
    root.unmount();
  };
}
