from fastapi import FastAPI
import socketio
app = FastAPI()

sio = socketio.AsyncServer(cors_allowed_origins="*" , async_mode='asgi')
socket_app = socketio.ASGIApp(sio)

app.mount("/ws", socket_app)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@sio.on("connect")
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    await sio.emit("response", {"message": "Welcome!"}, to=sid)

@sio.on("disconnect")
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

