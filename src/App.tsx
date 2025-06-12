import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useState } from "react";
import Header from "./components/Header";
import UsernameModal from "./components/UsernameModal";
import CollaborativeEditor from "./components/CollaborativeEditor";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [usersCount, setUsersCount] = useState(1);

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

        <CollaborativeEditor 
          username={username}
          onConnectionChange={setIsConnected}
          onUsersCountChange={setUsersCount}
        />
      </div>
    </>
  );
}
