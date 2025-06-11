import type { DefaultReactSuggestionItem } from "@blocknote/react";

export const customSlashMenuItems = [
  {
    title: "Mermaid Diagram",
    onItemClick: (editor: any) => {
      editor.insertBlocks(
        [
          {
            type: "mermaid",
            props: {
              code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
            },
          },
        ],
        editor.getTextCursorPosition().block,
        "after"
      );
    },
    aliases: ["mermaid", "diagram", "flowchart", "graph", "chart"],
    group: "Media",
    icon: "📊",
  } as DefaultReactSuggestionItem,
];