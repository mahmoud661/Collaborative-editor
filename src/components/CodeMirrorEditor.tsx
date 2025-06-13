import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { ViewUpdate } from "@codemirror/view";

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDark?: boolean;
  className?: string;
}

export function CodeMirrorEditor({ 
  value, 
  onChange, 
  isDark = false,
  className = ""
}: CodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      basicSetup,
      javascript(), // Using JavaScript syntax highlighting as it's closest to Mermaid
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        "&": {
          fontSize: "14px",
          fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace"
        },
        ".cm-content": {
          padding: "12px",
          minHeight: "160px"
        },
        ".cm-focused": {
          outline: "none"
        },
        ".cm-editor": {
          borderRadius: "6px",
          border: isDark ? "1px solid rgb(55, 65, 81)" : "1px solid rgb(209, 213, 219)"
        }
      })
    ];

    if (isDark) {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: value,
      extensions
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [isDark, onChange, value]); // Include all dependencies but remove placeholder for now

  return <div ref={editorRef} className={className} />;
}
