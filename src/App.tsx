import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useState } from "react";
import Header from "./components/Header";
import { MermaidEditor } from "./components/MermaidEditor";
import { editorSchema } from "./components/editorSchema";

export default function App() {
  // Creates a new editor instance with the custom schema
  const editor = useCreateBlockNote({
    
    schema: editorSchema,
    initialContent: [
      {
        type: "paragraph",
        content: "Welcome to the Collaborative Editor!",
      },
      {
        type: "paragraph",
        content: "Press the '/' key to open the Slash Menu and add a Mermaid diagram",
      },
      {
        type: "paragraph",
      },
    ],
  });

  const [data, setData] = useState(editor.document);

  const handleChange = () => {
    // Get the current document (blocks) from the editor
    const currentBlocks = editor.document;
    setData(currentBlocks);
    // console.log("editor blocks:", currentBlocks);
    // console.log("editor data state:", data);
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <MermaidEditor 
          editor={editor}
          onChange={handleChange}
          theme="light"
          className="min-h-11 mb-6"
        />
        
      </div>
    </>
  );
}

