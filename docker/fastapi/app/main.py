"""
FastAPI application for Node-RED study examples.
Provides HTTP and WebSocket endpoints for learning and testing.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Node-RED Study API",
    description="Sample API for Node-RED learning examples",
    version="1.0.0"
)

# In-memory storage for demo purposes
data_store: List[Dict[str, Any]] = []


# ============================================================================
# Models
# ============================================================================

class Item(BaseModel):
    """Sample item model"""
    name: str
    description: str | None = None
    price: float
    quantity: int = 1


class Message(BaseModel):
    """Sample message model"""
    content: str
    timestamp: str | None = None


# ============================================================================
# HTTP Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Node-RED Study API",
        "version": "1.0.0",
        "endpoints": {
            "GET /": "This endpoint",
            "GET /health": "Health check",
            "GET /time": "Current server time",
            "GET /items": "List all items",
            "POST /items": "Create new item",
            "GET /items/{item_id}": "Get specific item",
            "PUT /items/{item_id}": "Update item",
            "DELETE /items/{item_id}": "Delete item",
            "POST /echo": "Echo message back",
            "WS /ws": "WebSocket connection"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/time")
async def get_time():
    """Get current server time"""
    return {
        "timestamp": datetime.now().isoformat(),
        "unix": datetime.now().timestamp()
    }


# ============================================================================
# Items CRUD Endpoints
# These endpoints demonstrate basic CRUD (Create, Read, Update, Delete) operations
# which are fundamental for learning REST API interactions with Node-RED
# ============================================================================

@app.get("/items")
async def list_items():
    """Get all items - READ operation for learning GET requests"""
    return {
        "count": len(data_store),
        "items": data_store
    }


@app.post("/items")
async def create_item(item: Item):
    """Create a new item - CREATE operation for learning POST requests with JSON body"""
    item_dict = item.model_dump()
    item_dict["id"] = len(data_store) + 1
    item_dict["created_at"] = datetime.now().isoformat()
    data_store.append(item_dict)

    logger.info(f"Created item: {item_dict}")
    return JSONResponse(
        status_code=201,
        content={"message": "Item created successfully", "item": item_dict}
    )


@app.get("/items/{item_id}")
async def get_item(item_id: int):
    """Get a specific item by ID - READ operation with path parameters"""
    for item in data_store:
        if item.get("id") == item_id:
            return item

    raise HTTPException(status_code=404, detail="Item not found")


@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    """Update an existing item - UPDATE operation for learning PUT requests"""
    for idx, stored_item in enumerate(data_store):
        if stored_item.get("id") == item_id:
            updated_item = item.model_dump()
            updated_item["id"] = item_id
            updated_item["created_at"] = stored_item.get("created_at")
            updated_item["updated_at"] = datetime.now().isoformat()
            data_store[idx] = updated_item

            logger.info(f"Updated item {item_id}: {updated_item}")
            return {"message": "Item updated successfully", "item": updated_item}

    raise HTTPException(status_code=404, detail="Item not found")


@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    """Delete an item - DELETE operation for learning DELETE requests"""
    for idx, item in enumerate(data_store):
        if item.get("id") == item_id:
            deleted_item = data_store.pop(idx)
            logger.info(f"Deleted item {item_id}")
            return {"message": "Item deleted successfully", "item": deleted_item}

    raise HTTPException(status_code=404, detail="Item not found")


@app.post("/echo")
async def echo_message(message: Message):
    """Echo message back with timestamp"""
    return {
        "echoed": message.content,
        "original_timestamp": message.timestamp,
        "server_timestamp": datetime.now().isoformat()
    }


# ============================================================================
# WebSocket Endpoints
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Simple WebSocket echo endpoint"""
    await websocket.accept()
    logger.info("WebSocket client connected to /ws")

    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received WebSocket message: {data}")

            response = {
                "type": "echo",
                "message": data,
                "timestamp": datetime.now().isoformat()
            }
            await websocket.send_json(response)

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected from /ws")


# ============================================================================
# Startup/Shutdown Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("FastAPI application started")
    logger.info("Available at: http://localhost:8000")
    logger.info("API docs at: http://localhost:8000/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("FastAPI application shutting down")
