import { BlockNoteView } from "@blocknote/mantine";
import { MermaidSlashMenu } from "./MermaidSlashMenu";
import { MermaidFormattingToolbar } from "./MermaidFormattingToolbar";

interface MermaidEditorProps {
  editor: any;
  onChange: () => void;
  theme?: "light" | "dark";
  className?: string;
}

export function MermaidEditor({ 
  editor, 
  onChange, 
  theme = "light", 
  className = "min-h-11 mb-6" 
}: MermaidEditorProps) {
  return (
    <BlockNoteView 
      editor={editor} 
      onChange={onChange}
      theme={theme}
      className={className}
      formattingToolbar={false} 
      slashMenu={false}
    >
      {/* Custom Formatting Toolbar with Mermaid support */}
      <MermaidFormattingToolbar editor={editor} />
      
      {/* Custom Slash Menu with Mermaid support */}
      <MermaidSlashMenu editor={editor} />
    </BlockNoteView>
  );
}
