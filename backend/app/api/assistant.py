from app.models.security import SupabaseAuthUser
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.core.exceptions import BaseAppException, ValidationError, ExternalServiceError, ConfigurationError, InternalServerError
import requests
import logging
import traceback


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

@router.post("/token")
async def create_assistant_token(current_user: SupabaseAuthUser = Depends(get_current_user)):
    """Create an assistant-ui cloud token for the authenticated user"""
    try:
        logger.info(f"[DEBUG] Current user JWT payload: {current_user}")
        
        # Supabase JWT uses 'sub' field for user ID, not 'user_id'
        user_id = current_user.id
        if not user_id:
            logger.error(f"[ERROR] No user ID found in JWT payload. Available keys: {list(current_user.keys())}")
            error = ValidationError("Invalid JWT: no user ID found", field="user_id")
            raise HTTPException(status_code=error.status_code, detail=error.message)
            
        logger.info(f"[DEBUG] Creating assistant token for user: {user_id}")
        
        # Get Assistant Cloud API key from settings
        assistant_api_key = settings.assistant_api_key
        logger.info(f"[DEBUG] Assistant API key configured: {bool(assistant_api_key)}")
        logger.info(f"[DEBUG] Assistant API key length: {len(assistant_api_key) if assistant_api_key else 0}")
        
        if not assistant_api_key:
            logger.error("[ERROR] Assistant API key not configured")
            error = ConfigurationError("Assistant API key not configured", config_key="assistant_api_key")
            raise HTTPException(status_code=error.status_code, detail=error.message)
        
        # Create assistant-ui token using their API
        # Using the workspace pattern to scope threads to the user
        workspace_id = user_id  # Use Supabase user ID as workspace
        
        headers = {
            "Authorization": f"Bearer {assistant_api_key}",
            'Aui-User-Id': user_id,
            "Aui-Workspace-Id": workspace_id,
            "Content-Type": "application/json"
        }
        
        logger.info(f"[DEBUG] Request headers: {headers}")
        logger.info(f"[DEBUG] Making request to: https://backend.assistant-api.com/v1/auth/tokens")
        
        # Call Assistant Cloud API to create token
        try:
            response = requests.post(
                "https://backend.assistant-api.com/v1/auth/tokens",
                headers=headers,
                timeout=settings.api_timeout
            )
            
            logger.info(f"[DEBUG] Response status code: {response.status_code}")
            logger.info(f"[DEBUG] Response headers: {dict(response.headers)}")
            
            if response.status_code != 200:
                logger.error(f"[ERROR] Assistant API error: {response.status_code} - {response.text}")
                logger.error(f"[ERROR] Response content: {response.content}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to create assistant token: {response.status_code} - {response.text}"
                )
            
            try:
                token_data = response.json()
                logger.info(f"[DEBUG] Successfully created assistant token for user: {user_id}")
                
                if "token" not in token_data:
                    logger.error(f"[ERROR] No 'token' field in response: {token_data}")
                    raise HTTPException(
                        status_code=500,
                        detail="Invalid response format from assistant API"
                    )
                
                return {"token": token_data["token"]}
                
            except ValueError as json_error:
                logger.error(f"[ERROR] Failed to parse JSON response: {str(json_error)}")
                logger.error(f"[ERROR] Raw response text: {response.text}")
                raise HTTPException(
                    status_code=500,
                    detail="Invalid JSON response from assistant API"
                )
                
        except requests.RequestException as req_error:
            logger.error(f"[ERROR] Request exception: {str(req_error)}")
            logger.error(f"[ERROR] Request exception type: {type(req_error).__name__}")
            logger.error(f"[ERROR] Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to connect to assistant API: {str(req_error)}"
            )
        
    except HTTPException:
        raise
    except BaseAppException as e:
        logger.error(f"[ERROR] Application error creating assistant token: {e}")
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"[ERROR] Unexpected error creating assistant token: {str(e)}")
        logger.error(f"[ERROR] Exception type: {type(e).__name__}")
        logger.error(f"[ERROR] Full traceback: {traceback.format_exc()}")
        error = InternalServerError(f"Internal server error while creating assistant token: {str(e)}")
        raise HTTPException(status_code=error.status_code, detail=error.message) 