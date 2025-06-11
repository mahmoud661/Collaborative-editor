import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import Header from "./components/Header";
export default function App() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote();
  console.log("Editor instance created:", editor);
  // Renders the editor instance using a React component.
  return (
    <>
      <Header />
      <BlockNoteView editor={editor} theme={"light"} className="min-h-11" />
    </>
  );
}

