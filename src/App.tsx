import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import Header from "./components/Header";
import { MermaidBlock } from "./components/MermaidBlock";
import { useState } from "react";

export default function App() {
  // Create a schema with custom blocks
  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      mermaid: MermaidBlock,
    },
  });

  // Creates a new editor instance with the custom schema
  const editor = useCreateBlockNote({
    schema,
  });
  
  const [data, setData] = useState(editor.document);

  const handleChange = () => {
    // Get the current document (blocks) from the editor
    const currentBlocks = editor.document;
    setData(currentBlocks);
    console.log("editor blocks:", currentBlocks);
    console.log("editor data state:", data);
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <BlockNoteView
          onChange={handleChange}
          editor={editor}
          theme={"light"}
          className="min-h-11 mb-6"
        />
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">How to add Mermaid diagrams:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Type <code className="bg-gray-200 px-1 rounded">/mermaid</code> in the editor to insert a Mermaid block</li>
            <li>• Or click the button below to manually insert a Mermaid block</li>
            <li>• Click the code icon in the Mermaid block to edit the diagram</li>
          </ul>
          
          <button
            onClick={() => {
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
            }}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Insert Mermaid Block
          </button>
        </div>
      </div>
    </>
  );
}

