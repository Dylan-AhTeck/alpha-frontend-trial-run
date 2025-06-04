#!/usr/bin/env python3

print("Testing basic Python functionality...")

try:
    import sys
    print(f"✅ Python version: {sys.version}")
    
    import fastapi
    print(f"✅ FastAPI version: {fastapi.__version__}")
    
    from fastapi import FastAPI
    print("✅ FastAPI import successful")
    
    app = FastAPI()
    print(f"✅ FastAPI app created: {type(app)}")
    
    @app.get("/")
    async def root():
        return {"message": "test"}
        
    print("✅ Route defined successfully")
    print("✅ All basic checks passed!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 