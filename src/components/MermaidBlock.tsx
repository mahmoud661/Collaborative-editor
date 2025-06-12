  import { defaultProps } from "@blocknote/core";
  import { createReactBlockSpec } from "@blocknote/react";
  import { useState, useEffect, useRef, useCallback } from "react";
  import { Edit, Eye, Code2, ChevronDown } from "lucide-react";
  import mermaid from "mermaid";
  import "./MermaidBlock.css";

  // Initialize mermaid
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    suppressErrorRendering: true,
  });

  // Mermaid Block Component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MermaidBlockComponent = (props: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isCustomSized, setIsCustomSized] = useState(false);
    const mermaidRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const blockRef = useRef<HTMLDivElement>(null);
    const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const animationFrameRef = useRef<number | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      };

      if (isDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isDropdownOpen]);

    // Handle resize functionality
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!blockRef.current) return;
      
      const rect = blockRef.current.getBoundingClientRect();
      resizeStartPos.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height
      };
      
      setIsResizing(true);
      setIsCustomSized(true);
      
      // Use requestAnimationFrame for smooth resizing
      const handleMouseMove = (e: MouseEvent) => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          if (!blockRef.current) return;
          
          const deltaX = e.clientX - resizeStartPos.current.x;
          const deltaY = e.clientY - resizeStartPos.current.y;
          
          // Get the editor container's width to constrain the maximum width
          const editorContainer = blockRef.current.closest('.bn-editor') || 
                                blockRef.current.closest('[data-node-type="blockContainer"]') ||
                                blockRef.current.closest('.ProseMirror') ||
                                blockRef.current.parentElement;
          const containerWidth = editorContainer ? editorContainer.clientWidth : window.innerWidth;
          const maxWidth = containerWidth - 64; // Account for padding, margins, and scrollbar
          
          const newWidth = Math.min(maxWidth, Math.max(200, resizeStartPos.current.width + deltaX));
          const newHeight = Math.max(150, resizeStartPos.current.height + deltaY);
          
          // Direct DOM manipulation for better performance
          blockRef.current.style.width = `${newWidth}px`;
          blockRef.current.style.height = `${newHeight}px`;
          blockRef.current.style.minWidth = `${newWidth}px`;
          blockRef.current.style.minHeight = `${newHeight}px`;
        });
      };
      
      const handleMouseUp = () => {
        setIsResizing(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }, []);

    // Reset size to auto when switching to edit mode
    useEffect(() => {
      if (isEditing && blockRef.current) {
        blockRef.current.style.width = '';
        blockRef.current.style.height = '';
        blockRef.current.style.minWidth = '';
        blockRef.current.style.minHeight = '';
        setIsCustomSized(false);
      }
    }, [isEditing]);

    // Cleanup animation frame on unmount
    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

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
      <div 
        ref={blockRef}
        className={`mermaid-block rounded-lg p-4 my-2 group resizable ${isResizing ? 'resizing' : ''} ${isCustomSized ? 'custom-sized' : ''}`}
      >
        {/* Header with icon and edit/preview toggle */}
        <div className={`flex justify-between items-center mb-2 transition-opacity duration-300 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="cursor-pointer flex items-center gap-1 p-1 rounded hover:bg-gray-100"
                contentEditable={false}
                aria-label="Mermaid diagram options"
                title="Mermaid diagram options"
              >
                <Code2 size={24} className="text-blue-600" />
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                    Mermaid Actions
                  </div>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Edit size={16} />
                    Edit Code
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                </div>
              )}
            </div>
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
              className="w-full h-40 p-3 border border-gray-300 rounded font-mono text-sm focus:outline-none"
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
        
        {/* Resize handle - only show in preview mode */}
        {!isEditing && (
          <div
            className="resize-handle"
            onMouseDown={handleResizeStart}
            title="Drag to resize"
          />
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