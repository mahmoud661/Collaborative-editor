import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Edit, Eye, Code2, ChevronDown, RotateCcw, Download, Palette, FileText } from "lucide-react";
import mermaid from "mermaid";
import { CodeMirrorEditor } from "./CodeMirrorEditor";
import { getTemplatesByCategory } from "./MermaidTemplates";
import { exportDiagram, isExportSupported } from "../utils/exportUtils";
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
  const [showTemplates, setShowTemplates] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Dropdown outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Apply stored size from props to DOM element
  useEffect(() => {
    if (blockRef.current && props.block.props.width && props.block.props.height) {
      blockRef.current.style.width = props.block.props.width;
      blockRef.current.style.height = props.block.props.height;
      blockRef.current.style.minWidth = props.block.props.width;
      blockRef.current.style.minHeight = props.block.props.height;
    }
  }, [props.block.props.width, props.block.props.height]);

  // Resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!blockRef.current) return;
    const rect = blockRef.current.getBoundingClientRect();
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    };
    setIsResizing(true);
    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(() => {
        if (!blockRef.current) return;
        const deltaX = e.clientX - resizeStartPos.current.x;
        const deltaY = e.clientY - resizeStartPos.current.y;
        const editorContainer =
          blockRef.current.closest(".bn-editor") ||
          blockRef.current.closest('[data-node-type="blockContainer"]') ||
          blockRef.current.closest(".ProseMirror") ||
          blockRef.current.parentElement;
        const containerWidth = editorContainer
          ? editorContainer.clientWidth
          : window.innerWidth;
        const maxWidth = containerWidth - 64;
        const newWidth = Math.min(
          maxWidth,
          Math.max(200, resizeStartPos.current.width + deltaX)
        );
        const newHeight = Math.max(150, resizeStartPos.current.height + deltaY);
        const widthPx = `${newWidth}px`;
        const heightPx = `${newHeight}px`;
        
        blockRef.current.style.width = widthPx;
        blockRef.current.style.height = heightPx;
        blockRef.current.style.minWidth = widthPx;
        blockRef.current.style.minHeight = heightPx;
      });
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Save the final size to block props
      if (blockRef.current) {
        const computedStyle = window.getComputedStyle(blockRef.current);
        const finalWidth = computedStyle.width;
        const finalHeight = computedStyle.height;
        
        props.editor.updateBlock(props.block, {
          type: "mermaid",
          props: { 
            ...props.block.props,
            width: finalWidth,
            height: finalHeight
          },
        });
      }
      
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [props.editor, props.block]);

  // Check if block has custom size from props
  const hasCustomSize = props.block.props.width && props.block.props.height;

  // Reset size on edit
  useEffect(() => {
    if (isEditing && blockRef.current && !hasCustomSize) {
      blockRef.current.style.width = "";
      blockRef.current.style.height = "";
      blockRef.current.style.minWidth = "";
      blockRef.current.style.minHeight = "";
    }
  }, [isEditing, hasCustomSize]);

  useEffect(
    () => () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    },
    []
  );

  // Render mermaid
  const renderMermaid = useCallback(async () => {
    if (!mermaidRef.current || !props.block.props.code) return;
    try {
      setError(null);
      
      // Configure mermaid theme
      mermaid.initialize({
        startOnLoad: false,
        theme: props.block.props.theme || "default",
        securityLevel: "loose",
        suppressErrorRendering: true,
      });
      
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const { svg } = await mermaid.render(id, props.block.props.code);
      mermaidRef.current.innerHTML = svg;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid Mermaid syntax");
      mermaidRef.current.innerHTML = "";
    }
  }, [props.block.props.code, props.block.props.theme]);

  useEffect(() => {
    if (!isEditing && props.block.props.code && mermaidRef.current) {
      renderMermaid();
    } else if (isEditing) {
      // Clear error when switching to edit mode
      setError(null);
    }
  }, [props.block.props.code, isEditing, renderMermaid]);

  // Fix: always update code on change, even if error
  const [draftCode, setDraftCode] = useState(props.block.props.code || "");
  useEffect(() => {
    setDraftCode(props.block.props.code || "");
  }, [props.block.props.code]);

  const handleCodeChange = (newCode: string) => {
    setDraftCode(newCode);
    // Only update block if code is different to avoid unnecessary renders
    if (props.block.props.code !== newCode) {
      props.editor.updateBlock(props.block, {
        type: "mermaid",
        props: { code: newCode },
      });
    }
  };

  const handleResetSize = useCallback(() => {
    if (blockRef.current) {
      blockRef.current.style.width = "";
      blockRef.current.style.height = "";
      blockRef.current.style.minWidth = "";
      blockRef.current.style.minHeight = "";
      setIsDropdownOpen(false);
      
      // Reset size in block props
      props.editor.updateBlock(props.block, {
        type: "mermaid",
        props: { 
          ...props.block.props,
          width: "",
          height: ""
        },
      });
    }
  }, [props.editor, props.block]);

  // Theme handlers
  const handleThemeChange = useCallback((theme: string) => {
    props.editor.updateBlock(props.block, {
      type: "mermaid",
      props: { 
        ...props.block.props,
        theme
      },
    });
    setShowThemes(false);
    setIsDropdownOpen(false);
  }, [props.editor, props.block]);

  // Template handlers
  const handleTemplateSelect = useCallback((templateCode: string) => {
    setDraftCode(templateCode);
    props.editor.updateBlock(props.block, {
      type: "mermaid",
      props: { 
        ...props.block.props,
        code: templateCode
      },
    });
    setShowTemplates(false);
    setIsDropdownOpen(false);
  }, [props.editor, props.block]);

  // Export handlers
  const handleExport = useCallback(async (format: 'png' | 'svg') => {
    if (!mermaidRef.current || !isExportSupported()) {
      alert('Export is not supported in this browser');
      return;
    }

    try {
      await exportDiagram(mermaidRef.current, { 
        format,
        filename: `mermaid-diagram-${Date.now()}`
      });
      setShowExport(false);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }, []);

  // Add debug to edit/preview button
  return (
    <div
      ref={blockRef}
      className={`mermaid-block rounded-lg p-4 my-2 group resizable bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${
        isResizing ? "resizing" : ""
      } ${hasCustomSize ? "custom-sized" : ""}`}
    >
      <div
        className={`flex justify-between items-center mb-2 transition-opacity duration-300 ${
          isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="cursor-pointer flex items-center gap-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              contentEditable={false}
              aria-label="Mermaid diagram options"
              title="Mermaid diagram options"
            >
              <Code2 size={24} className="text-blue-600" />
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  Mermaid Actions
                </div>
                
                {/* Basic Actions */}
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Edit size={16} />
                  Edit Code
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Eye size={16} />
                  Preview
                </button>

                {/* Templates */}
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <FileText size={16} />
                    Templates
                    <ChevronDown size={14} className={`ml-auto transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                  </button>
                  {showTemplates && (
                    <div className="max-h-48 overflow-y-auto">
                      {Object.entries(getTemplatesByCategory()).map(([category, templates]) => (
                        <div key={category} className="px-3 py-1">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{category}</div>
                          {templates.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => handleTemplateSelect(template.code)}
                              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                              title={template.description}
                            >
                              {template.name}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Themes */}
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => setShowThemes(!showThemes)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <Palette size={16} />
                    Theme
                    <ChevronDown size={14} className={`ml-auto transition-transform ${showThemes ? 'rotate-180' : ''}`} />
                  </button>
                  {showThemes && (
                    <div className="px-3 py-2">
                      {['default', 'neutral', 'dark', 'forest', 'base'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => handleThemeChange(theme)}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 rounded capitalize ${
                            props.block.props.theme === theme ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export */}
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => setShowExport(!showExport)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <Download size={16} />
                    Export
                    <ChevronDown size={14} className={`ml-auto transition-transform ${showExport ? 'rotate-180' : ''}`} />
                  </button>
                  {showExport && (
                    <div className="px-3 py-2">
                      <button
                        onClick={() => handleExport('png')}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                      >
                        Export as PNG
                      </button>
                      <button
                        onClick={() => handleExport('svg')}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                      >
                        Export as SVG
                      </button>
                    </div>
                  )}
                </div>

                {/* Reset Size */}
                {hasCustomSize && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={handleResetSize}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <RotateCcw size={16} />
                      Reset Size
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Mermaid Diagram
          </span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          contentEditable={false}
        >
          {isEditing ? "Preview" : "Edit"}
        </button>
      </div>
      {isEditing ? (
        <div>
          <CodeMirrorEditor
            value={draftCode}
            onChange={handleCodeChange}
            isDark={document.documentElement.classList.contains('dark')}
            className="mb-2"
          />
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Press Ctrl+Enter (Cmd+Enter on Mac) to preview, Escape to cancel
          </div>
        </div>
      ) : (
        <div>
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-red-700 dark:text-red-400">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <div
              ref={mermaidRef}
              className="mermaid-diagram flex justify-center min-h-[100px]"
            >
              {!props.block.props.code && (
                <div className="text-gray-400 dark:text-gray-500 text-center py-8">
                  Click "Edit" to add your Mermaid diagram
                </div>
              )}
            </div>
          )}
        </div>
      )}
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
      width: {
        default: "",
      },
      height: {
        default: "",
      },
      theme: {
        default: "default",
      },
    },
    content: "none",
  },
  {
    render: (props) => <MermaidBlockComponent {...props} />,
  }
);

