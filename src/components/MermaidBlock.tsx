import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Menu } from "@mantine/core";
import { useState, useEffect, useRef, useCallback } from "react";
import { MdEdit, MdVisibility, MdCode } from "react-icons/md";
import mermaid from "mermaid";
import "./MermaidBlock.css";

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
});

// Mermaid Block Component
const MermaidBlockComponent = (props: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  const renderMermaid = useCallback(async () => {
    if (!mermaidRef.current || !props.block.props.code) return;

    try {
      setError(null);
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const { svg } = await mermaid.render(id, props.block.props.code);
      mermaidRef.current.innerHTML = svg;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid Mermaid syntax");
      mermaidRef.current.innerHTML = "";
    }
  }, [props.block.props.code]);

  useEffect(() => {
    if (!isEditing && props.block.props.code && mermaidRef.current) {
      renderMermaid();
    }
  }, [props.block.props.code, isEditing, renderMermaid]);

  const handleCodeChange = (newCode: string) => {
    props.editor.updateBlock(props.block, {
      type: "mermaid",
      props: { code: newCode },
    });
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
    <div className="mermaid-block border border-gray-200 rounded-lg p-4 my-2">
      {/* Header with icon and edit/preview toggle */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Menu withinPortal={false}>
            <Menu.Target>
              <div className="cursor-pointer" contentEditable={false}>
                <MdCode size={24} className="text-blue-600" />
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Mermaid Actions</Menu.Label>
              <Menu.Divider />
              <Menu.Item
                leftSection={<MdEdit />}
                onClick={() => setIsEditing(true)}
              >
                Edit Code
              </Menu.Item>
              <Menu.Item
                leftSection={<MdVisibility />}
                onClick={() => setIsEditing(false)}
              >
                Preview
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <span className="text-sm font-medium text-gray-600">Mermaid Diagram</span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          contentEditable={false}
        >
          {isEditing ? "Preview" : "Edit"}
        </button>
      </div>

      {/* Content area */}
      {isEditing ? (
        <div>
          <textarea
            value={props.block.props.code}
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
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <div
              ref={mermaidRef}
              className="mermaid-diagram flex justify-center min-h-[100px]"
            >
              {!props.block.props.code && (
                <div className="text-gray-400 text-center py-8">
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

// The Mermaid block.
export const MermaidBlock = createReactBlockSpec(
  {
    type: "mermaid",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      code: {
        default: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
      },
    },
    content: "none",
  },
  {
    render: (props) => <MermaidBlockComponent {...props} />,
  }
);