import { useEffect, useState } from "react";

interface User {
  name: string;
  color: string;
}

interface UserListProps {
  awareness: any;
  currentUsername: string;
}

export default function UserList({ awareness, currentUsername }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!awareness) return;

    const updateUsers = () => {
      const allUsers: User[] = [];
      const states = awareness.getStates();
      
      console.log("Awareness states:", states); // Debug log
      
      states.forEach((state: any) => {
        if (state.user) {
          allUsers.push({
            name: state.user.name,
            color: state.user.color,
          });
        }
      });
      
      console.log("Users from awareness:", allUsers); // Debug log
      setUsers(allUsers);
    };

    // Initial update
    updateUsers();

    // Listen for changes
    awareness.on("change", updateUsers);

    return () => {
      awareness.off("change", updateUsers);
    };
  }, [awareness]);

  if (users.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Connected Users ({users.length}):
      </h3>
      <div className="flex flex-wrap gap-2">
        {users.map((user, index) => (
          <div
            key={`${user.name}-${index}`}
            className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: user.color }}
            ></div>
            <span className="text-sm font-medium">
              {user.name === currentUsername ? `${user.name} (You)` : user.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
