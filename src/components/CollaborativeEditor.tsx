import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useState } from "react";
import { MermaidEditor } from "./MermaidEditor";
import { editorSchema } from "./editorSchema";
import { createYjsConnection, getRandomColor } from "../service/yjs-provider";
import UserList from "./UserList";

interface CollaborativeEditorProps {
  username: string;
  onConnectionChange: (isConnected: boolean) => void;
  onUsersCountChange: (count: number) => void;
}

// Separate component for the editor with collaboration
function CollaborativeEditorCore({ 
  connection, 
  username, 
  userColor 
}: { 
  connection: ReturnType<typeof createYjsConnection>;
  username: string;
  userColor: string;
}) {
  // Create editor with collaboration
  const editor = useCreateBlockNote({
    schema: editorSchema,
    // Remove initialContent to avoid conflicts with collaboration
    collaboration: {
      provider: connection.provider,
      fragment: connection.ydoc.getXmlFragment("document-store"),
      user: {
        name: username,
        color: userColor,
      },
      showCursorLabels: "always", // Always show cursor labels to see other users
    },
  });

  const handleChange = () => {
    // The collaboration is handled automatically by Yjs
    // No need for manual synchronization
  };

  return (
    <>
      <UserList 
        awareness={connection.awareness} 
        currentUsername={username}
      />
      <MermaidEditor 
        editor={editor}
        onChange={handleChange}
        theme="light"
        className="min-h-11 mb-6"
      />
    </>
  );
}

export default function CollaborativeEditor({ 
  username, 
  onConnectionChange, 
  onUsersCountChange 
}: CollaborativeEditorProps) {
  const [userColor] = useState(getRandomColor());
  const [connection, setConnection] = useState<ReturnType<typeof createYjsConnection> | null>(null);

  // Initialize Yjs connection
  useEffect(() => {
    const yjsConnection = createYjsConnection(username);
    setConnection(yjsConnection);

    // Handle socket connection events
    yjsConnection.socket.on("connect", () => {
      console.log("Connected to server");
      onConnectionChange(true);
    });

    yjsConnection.socket.on("disconnect", () => {
      console.log("Disconnected from server");
      onConnectionChange(false);
    });

    yjsConnection.socket.on("connected", (data) => {
      console.log("Welcome message:", data.message);
      if (data.users_count) onUsersCountChange(data.users_count);
    });

    yjsConnection.socket.on("user-joined", (data) => {
      console.log(`${data.username} joined the room`);
      if (data.users_count) onUsersCountChange(data.users_count);
    });

    yjsConnection.socket.on("user-left", (data) => {
      console.log(`${data.username} left the room`);
      if (data.users_count) onUsersCountChange(data.users_count);
    });

    // Listen for awareness changes to track connected users
    yjsConnection.awareness.on("change", () => {
      const users = Array.from(yjsConnection.awareness.getStates().values());
      const userCount = users.filter(user => user.user).length;
      console.log("Awareness changed, users:", userCount);
      onUsersCountChange(Math.max(1, userCount));
    });

    // Cleanup on unmount
    return () => {
      yjsConnection.socket.disconnect();
      yjsConnection.provider.destroy();
    };
  }, [username, onConnectionChange, onUsersCountChange]);

  // Show loading while connection is being established
  if (!connection) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing collaboration...</p>
        </div>
      </div>
    );
  }

  return (
    <CollaborativeEditorCore 
      connection={connection}
      username={username}
      userColor={userColor}
    />
  );
}
