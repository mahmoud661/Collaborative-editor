import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import { MermaidEditor } from "./components/MermaidEditor";
import { editorSchema } from "./components/editorSchema";
import UsernameModal from "./components/UsernameModal";
import { createYjsConnection, getRandomColor } from "./service/yjs-provider";
import * as Y from "yjs";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [usersCount, setUsersCount] = useState(1);
  const [yjsDoc, setYjsDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [userColor] = useState(getRandomColor());

  // Initialize Yjs connection when username is set
  useEffect(() => {
    if (username && !yjsDoc) {
      const connection = createYjsConnection(username);
      setYjsDoc(connection.ydoc);
      setProvider(connection.provider);

      // Handle socket connection events for user management
      connection.socket.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);
      });

      connection.socket.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
      });

      connection.socket.on("user-joined", (data) => {
        console.log(`${data.username} joined the room`);
        setUsersCount(data.users_count || usersCount + 1);
      });

      connection.socket.on("user-left", (data) => {
        console.log(`${data.username} left the room`);
        setUsersCount(data.users_count || Math.max(1, usersCount - 1));
      });

      connection.socket.on("users-count", (data) => {
        setUsersCount(data.count);
      });

      // Cleanup on unmount
      return () => {
        connection.socket.disconnect();
        connection.provider.destroy();
      };
    }
  }, [username, yjsDoc, usersCount]);

  // Creates a new editor instance with collaboration
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
        content: "Start typing to see real-time collaboration in action!",
      },
    ],
    collaboration: yjsDoc && provider ? {
      provider: provider,
      fragment: yjsDoc.getXmlFragment("document-store"),
      user: {
        name: username || "Anonymous",
        color: userColor,
      },
      showCursorLabels: "activity",
    } : undefined,
  });

  const [data, setData] = useState(editor.document);

  const handleChange = () => {
    // Get the current document (blocks) from the editor
    const currentBlocks = editor.document;
    setData(currentBlocks);
  };

  // Show username modal if not logged in
  if (!username) {
    return <UsernameModal onSubmit={setUsername} />;
  }

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        {/* Connection status */}
        <div className="mb-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? `Connected as ${username}` : 'Connecting...'}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {usersCount} user{usersCount !== 1 ? 's' : ''} online
          </span>
        </div>

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
