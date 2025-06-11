import { filterSuggestionItems, insertOrUpdateBlock } from "@blocknote/core";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { Code2 } from "lucide-react";

// Slash menu item to insert a Mermaid block
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const insertMermaid = (editor: any) => ({
  title: "Mermaid Diagram",
  subtext: "Insert a Mermaid diagram",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "mermaid",
      props: {
        code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E` as string,
      },
    }),
  aliases: [
    "mermaid",
    "diagram",
    "flowchart",
    "graph",
    "chart",
    "sequence",
    "class",
    "state",
  ],
  group: "Media",
  icon: <Code2 />,
});

interface MermaidSlashMenuProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;
}

export function MermaidSlashMenu({ editor }: MermaidSlashMenuProps) {
  return (
    <SuggestionMenuController
      triggerCharacter={"/"}
      getItems={async (query) => {
        // Gets all default slash menu items.
        const defaultItems = getDefaultReactSlashMenuItems(editor);
        // Finds index of last item in "Media" group, or adds to end if group doesn't exist.
        let lastMediaIndex = -1;
        for (let i = defaultItems.length - 1; i >= 0; i--) {
          if (defaultItems[i].group === "Media") {
            lastMediaIndex = i;
            break;
          }
        }
        const insertIndex =
          lastMediaIndex >= 0 ? lastMediaIndex + 1 : defaultItems.length;

        // Inserts the Mermaid item in the "Media" group.
        defaultItems.splice(insertIndex, 0, insertMermaid(editor));

        // Returns filtered items based on the query.
        return filterSuggestionItems(defaultItems, query);
      }}
    />
  );
}

