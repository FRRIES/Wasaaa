from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import httpx
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== Models ====================

class Method(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    api_ids: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MethodCreate(BaseModel):
    name: str

class APIConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    url: str
    token: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class APIConfigCreate(BaseModel):
    name: str
    url: str
    token: Optional[str] = None

class AttackHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    host: str
    port: int
    time: int
    method: str
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AttackRequest(BaseModel):
    host: str
    port: int
    time: int
    method: str

class TargetCheckRequest(BaseModel):
    host: str
    check_type: str  # 'http' or 'ping'

class ConfigSettings(BaseModel):
    max_time_allowed: int = 300

class LinkAPIToMethod(BaseModel):
    method_id: str
    api_ids: List[str]

# ==================== Routes ====================

@api_router.get("/")
async def root():
    return {"message": "Stress Test API v1.0"}

# ==================== Methods Management ====================

@api_router.get("/methods", response_model=List[Method])
async def get_methods():
    methods = await db.methods.find().to_list(1000)
    return [Method(**method) for method in methods]

@api_router.post("/methods", response_model=Method)
async def create_method(method_data: MethodCreate):
    method = Method(**method_data.dict())
    await db.methods.insert_one(method.dict())
    return method

@api_router.delete("/methods/{method_id}")
async def delete_method(method_id: str):
    result = await db.methods.delete_one({"id": method_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Method not found")
    return {"message": "Method deleted successfully"}

@api_router.post("/methods/link")
async def link_api_to_method(link_data: LinkAPIToMethod):
    result = await db.methods.update_one(
        {"id": link_data.method_id},
        {"$set": {"api_ids": link_data.api_ids}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Method not found")
    return {"message": "APIs linked successfully"}

# ==================== API Config Management ====================

@api_router.get("/configs", response_model=List[APIConfig])
async def get_configs():
    configs = await db.api_configs.find().to_list(1000)
    return [APIConfig(**config) for config in configs]

@api_router.post("/configs", response_model=APIConfig)
async def create_config(config_data: APIConfigCreate):
    config = APIConfig(**config_data.dict())
    await db.api_configs.insert_one(config.dict())
    return config

@api_router.delete("/configs/{config_id}")
async def delete_config(config_id: str):
    result = await db.api_configs.delete_one({"id": config_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Config not found")
    return {"message": "Config deleted successfully"}

# ==================== Config Settings ====================

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"type": "config"})
    if not settings:
        default_settings = {"type": "config", "max_time_allowed": 300}
        await db.settings.insert_one(default_settings)
        return {"max_time_allowed": 300}
    return {"max_time_allowed": settings.get("max_time_allowed", 300)}

@api_router.post("/settings")
async def update_settings(settings: ConfigSettings):
    await db.settings.update_one(
        {"type": "config"},
        {"$set": {"max_time_allowed": settings.max_time_allowed}},
        upsert=True
    )
    return {"message": "Settings updated successfully"}

# ==================== Target Check ====================

@api_router.post("/check-target")
async def check_target(request: TargetCheckRequest):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            if request.check_type == 'http':
                url = f"https://check-host.net/check-http?host={request.host}&max_nodes=3"
            else:
                url = f"https://check-host.net/check-ping?host={request.host}&max_nodes=3"
            
            headers = {"Accept": "application/json"}
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                # Get the request_id from the response
                request_id = data.get('request_id')
                
                if request_id:
                    # Wait a bit for results
                    await asyncio.sleep(2)
                    
                    # Fetch results
                    if request.check_type == 'http':
                        result_url = f"https://check-host.net/check-result/{request_id}"
                    else:
                        result_url = f"https://check-host.net/check-result/{request_id}"
                    
                    result_response = await client.get(result_url, headers=headers)
                    
                    if result_response.status_code == 200:
                        results = result_response.json()
                        # Check if any node returned a successful result
                        alive = False
                        for key, value in results.items():
                            if value and isinstance(value, list) and len(value) > 0:
                                alive = True
                                break
                        
                        return {
                            "status": "alive" if alive else "unreachable",
                            "details": results
                        }
                
                return {"status": "checking", "message": "Check initiated"}
            else:
                return {"status": "error", "message": "Failed to check target"}
    except Exception as e:
        logging.error(f"Error checking target: {str(e)}")
        return {"status": "error", "message": str(e)}

# ==================== Attack ====================

@api_router.post("/attack")
async def send_attack(attack_data: AttackRequest):
    try:
        # Get all methods and find the one matching the request
        methods = await db.methods.find().to_list(1000)
        target_method = None
        for method in methods:
            if method['name'].lower() == attack_data.method.lower():
                target_method = method
                break
        
        if not target_method or not target_method.get('api_ids'):
            raise HTTPException(status_code=400, detail="Method not found or no APIs linked to this method")
        
        # Get the first API config linked to this method
        api_config = await db.api_configs.find_one({"id": target_method['api_ids'][0]})
        
        if not api_config:
            raise HTTPException(status_code=400, detail="API config not found")
        
        # Build the attack URL
        base_url = api_config['url']
        
        # Replace placeholders in the URL
        attack_url = base_url.replace('[host]', attack_data.host)
        attack_url = attack_url.replace('[port]', str(attack_data.port))
        attack_url = attack_url.replace('[time]', str(attack_data.time))
        attack_url = attack_url.replace('[method]', attack_data.method)
        
        # Send the attack request
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(attack_url)
            
            # Save to history
            history = AttackHistory(
                host=attack_data.host,
                port=attack_data.port,
                time=attack_data.time,
                method=attack_data.method,
                status="sent"
            )
            await db.attack_history.insert_one(history.dict())
            
            return {
                "success": True,
                "message": "Attack Sent",
                "response_status": response.status_code
            }
    except Exception as e:
        logging.error(f"Error sending attack: {str(e)}")
        # Still save to history as failed
        history = AttackHistory(
            host=attack_data.host,
            port=attack_data.port,
            time=attack_data.time,
            method=attack_data.method,
            status="failed"
        )
        await db.attack_history.insert_one(history.dict())
        raise HTTPException(status_code=500, detail=str(e))

# ==================== History ====================

@api_router.get("/history", response_model=List[AttackHistory])
async def get_history():
    history = await db.attack_history.find().sort("timestamp", -1).to_list(1000)
    return [AttackHistory(**item) for item in history]

@api_router.delete("/history")
async def clear_history():
    await db.attack_history.delete_many({})
    return {"message": "History cleared successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
