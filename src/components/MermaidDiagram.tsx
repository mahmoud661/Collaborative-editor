import { useState, useEffect, useRef, useCallback } from "react";
import mermaid from "mermaid";
import "./MermaidBlock.css";

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
});

interface MermaidDiagramProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ 
  initialCode = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
  onCodeChange 
}) => {
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  const renderMermaid = useCallback(async () => {
    if (!mermaidRef.current || !code) return;

    try {
      setError(null);
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const { svg } = await mermaid.render(id, code);
      mermaidRef.current.innerHTML = svg;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid Mermaid syntax");
      mermaidRef.current.innerHTML = "";
    }
  }, [code]);

  useEffect(() => {
    if (!isEditing && code && mermaidRef.current) {
      renderMermaid();
    }
  }, [code, isEditing, renderMermaid]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      setIsEditing(false);
    }
  };

  return (
    <div className="mermaid-block">
      {/* Header with edit/preview toggle */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <span className="text-sm font-medium text-gray-600">Mermaid Diagram</span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="mermaid-edit-btn"
        >
          {isEditing ? "Preview" : "Edit"}
        </button>
      </div>

      {/* Content area */}
      {isEditing ? (
        <div>
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your Mermaid diagram code here..."
            className="w-full h-40 p-3 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="mt-2 text-xs text-gray-500">
            Press Ctrl+Enter (Cmd+Enter on Mac) to preview, Escape to cancel
          </div>
        </div>
      ) : (
        <div>
          {error ? (
            <div className="mermaid-error">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <div
              ref={mermaidRef}
              className="mermaid-diagram flex justify-center min-h-[100px]"
            >
              {!code && (
                <div className="mermaid-empty">
                  Click "Edit" to add your Mermaid diagram
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
