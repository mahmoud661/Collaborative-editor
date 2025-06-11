import {
  type BlockTypeSelectItem,
  FormattingToolbar,
  FormattingToolbarController,
  blockTypeSelectItems,
} from "@blocknote/react";
import { Code2 } from "lucide-react";

interface MermaidFormattingToolbarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;
}

export function MermaidFormattingToolbar({
  editor,
}: MermaidFormattingToolbarProps) {
  return (
    <FormattingToolbarController
      formattingToolbar={() => (
        <FormattingToolbar
          blockTypeSelectItems={[
            // Gets the default Block Type Select items.
            ...blockTypeSelectItems(editor.dictionary),
            // Adds an item for the Mermaid block.
            {
              name: "Mermaid Diagram",
              type: "mermaid",
              icon: Code2,
              isSelected: (block) => block.type === "mermaid",
            } satisfies BlockTypeSelectItem,
          ]}
        />
      )}
    />
  );
}

