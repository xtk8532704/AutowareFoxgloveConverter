import React from "react";
import { PanelExtensionContext } from "@foxglove/studio";
import { createRoot } from "react-dom/client";
import { useDLRResult, DLRPanelLayout } from "./DLRBasePanel";

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
    <DLRPanelLayout
      result={result}
      allConditions={allConditions}
      currentFrameConditions={currentFrameConditions}
      lastRawMessage={lastRawMessage}
      debugMode={debugMode}
      setDebugMode={setDebugMode}
      error={error}
      conditionOrder={conditionOrder}
      topicName="/driving_log_replayer/diagnostics/results"
    />
  );
}

// Export function
export function initDLRDiagnosticsPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<DLRDiagnosticsPanel context={context} />);
  return () => {
    root.unmount();
  };
}
