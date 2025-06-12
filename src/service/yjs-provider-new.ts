import * as Y from "yjs";
import { io, Socket } from "socket.io-client";
import { Awareness } from "y-protocols/awareness";
import { encodeAwarenessUpdate, applyAwarenessUpdate } from "y-protocols/awareness";

export class SocketIOProvider {
  public awareness: Awareness;
  public ydoc: Y.Doc;
  public socket: Socket;
  private roomId: string;
  private username: string;

  constructor(roomId: string, ydoc: Y.Doc, username: string) {
    this.roomId = roomId;
    this.ydoc = ydoc;
    this.username = username;
    
    // Create awareness for cursor sharing
    this.awareness = new Awareness(ydoc);
    
    // Set user info in awareness
    this.awareness.setLocalStateField("user", {
      name: username,
      color: this.getRandomColor(),
    });
    
    // Create socket connection to FastAPI server
    this.socket = io("http://localhost:8000", {
      transports: ["websocket"],
      query: { username, room: roomId }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Set up Yjs synchronization over Socket.IO
    this.socket.on("yjs-update", (update: number[]) => {
      const updateUint8 = new Uint8Array(update);
      Y.applyUpdate(this.ydoc, updateUint8);
    });

    this.socket.on("awareness-update", (update: number[]) => {
      const updateUint8 = new Uint8Array(update);
      applyAwarenessUpdate(this.awareness, updateUint8, "server");
    });

    // Send Yjs updates to server
    this.ydoc.on("update", (update: Uint8Array) => {
      this.socket.emit("yjs-update", Array.from(update));
    });

    // Send awareness updates to server
    this.awareness.on("update", ({ added, updated, removed }: any) => {
      const changedClients = added.concat(updated).concat(removed);
      if (changedClients.length > 0) {
        const update = encodeAwarenessUpdate(this.awareness, changedClients);
        this.socket.emit("awareness-update", Array.from(update));
      }
    });
  }

  connect() {
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  destroy() {
    this.socket.disconnect();
  }

  on(event: string, handler: Function) {
    this.socket.on(event, handler);
  }

  off(event: string, handler: Function) {
    this.socket.off(event, handler);
  }

  private getRandomColor(): string {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
      "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export interface YjsConnection {
  ydoc: Y.Doc;
  provider: SocketIOProvider;
  socket: Socket;
  awareness: Awareness;
}

export function createYjsConnection(username: string, roomId: string = "collaborative-editor"): YjsConnection {
  const ydoc = new Y.Doc();
  const provider = new SocketIOProvider(roomId, ydoc, username);
  
  return {
    ydoc,
    provider,
    socket: provider.socket,
    awareness: provider.awareness
  };
}

export function getRandomColor(): string {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
