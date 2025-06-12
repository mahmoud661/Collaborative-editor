from fastapi import FastAPI
import socketio
from typing import Dict, Set

app = FastAPI()

sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode='asgi')
socket_app = socketio.ASGIApp(sio)

app.mount("/", socket_app)

# Store connected users and rooms
connected_users: Dict[str, Dict] = {}
rooms: Dict[str, Set[str]] = {}
room_documents: Dict[str, bytes] = {}
room_awareness: Dict[str, bytes] = {}  # Store awareness state per room

@app.get("/api/health")
async def health():
    return {"message": "Collaborative Editor Server Running"}

@sio.on("connect")
async def connect(sid, environ):
    query = environ.get('QUERY_STRING', '')
    params = dict(param.split('=') for param in query.split('&') if '=' in param)
    username = params.get('username', f'User_{sid[:8]}')
    room = params.get('room', 'default-room')
    
    # Store user info
    connected_users[sid] = {
        'username': username,
        'room': room
    }
    
    # Add to room
    if room not in rooms:
        rooms[room] = set()
    rooms[room].add(sid)
    
    print(f"User '{username}' connected to room '{room}' (sid: {sid})")
    
    # Join socket.io room
    await sio.enter_room(sid, room)
    
    # Send current document state if exists
    if room in room_documents:
        await sio.emit("yjs-update", list(room_documents[room]), to=sid)
    
    # Send current awareness state if exists
    if room in room_awareness:
        await sio.emit("awareness-update", list(room_awareness[room]), to=sid)
    
    # Notify others in room
    await sio.emit("user-joined", {
        "username": username,
        "users_count": len(rooms[room])
    }, room=room, skip_sid=sid)
    
    # Send welcome message
    await sio.emit("connected", {
        "message": f"Welcome {username}!",
        "room": room,
        "users_count": len(rooms[room])
    }, to=sid)

@sio.on("disconnect")
async def disconnect(sid):
    if sid in connected_users:
        user_info = connected_users[sid]
        username = user_info['username']
        room = user_info['room']
        
        # Remove from room
        if room in rooms:
            rooms[room].discard(sid)
            if not rooms[room]:
                # Clean up empty room
                del rooms[room]
                if room in room_documents:
                    del room_documents[room]
                if room in room_awareness:
                    del room_awareness[room]
        
        # Remove user
        del connected_users[sid]
        
        print(f"User '{username}' disconnected from room '{room}' (sid: {sid})")
        
        # Notify others in room
        if room in rooms:
            await sio.emit("user-left", {
                "username": username,
                "users_count": len(rooms[room])
            }, room=room)

@sio.on("yjs-update")
async def handle_yjs_update(sid, update_data):
    if sid in connected_users:
        room = connected_users[sid]['room']
        username = connected_users[sid]['username']
        
        print(f"📤 User '{username}' sent Yjs update ({len(update_data)} bytes) to room '{room}'")
        
        # Convert list back to bytes
        update_bytes = bytes(update_data)
        
        # Store/update the document state
        room_documents[room] = update_bytes
        
        # Broadcast to other users in the same room
        await sio.emit("yjs-update", update_data, room=room, skip_sid=sid)
        print(f"📡 Broadcasted update to {len(rooms.get(room, [])) - 1} other users in room '{room}'")

@sio.on("awareness-update")
async def handle_awareness_update(sid, update_data):
    if sid in connected_users:
        room = connected_users[sid]['room']
        username = connected_users[sid]['username']
        
        print(f"👁️ User '{username}' sent awareness update ({len(update_data)} bytes) to room '{room}'")
        
        # Convert list back to bytes
        update_bytes = bytes(update_data)
        
        # Store/update the awareness state
        room_awareness[room] = update_bytes
        
        # Broadcast to other users in the same room
        await sio.emit("awareness-update", update_data, room=room, skip_sid=sid)
        print(f"👀 Broadcasted awareness to {len(rooms.get(room, [])) - 1} other users in room '{room}'")

