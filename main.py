from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import asyncio
from processador import processar_video  # Seu código anterior

app = FastAPI()
app.mount("/cortes", StaticFiles(directory="cortes"), name="cortes")
connected_clients = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        connected_clients.remove(websocket)

async def broadcast_progress(data):
    for client in connected_clients[:]:
        try:
            await client.send_json(data)
        except:
            connected_clients.remove(client)

@app.post("/api/process")
async def process_video(data: dict):
    url = data['url']
    
    # Progresso em tempo real
    await broadcast_progress({"status": "baixando", "progress": 20})
    
    cortes = processar_video(url)  # Seu código Python
    
    await broadcast_progress({
        "status": "concluido", 
        "progress": 100, 
        "cortes": cortes
    })
    
    return {"success": True, "cortes": cortes}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)