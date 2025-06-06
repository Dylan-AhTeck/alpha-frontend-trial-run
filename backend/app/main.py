import logging
import traceback
import uuid
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.admin import router as admin_router
from app.api.assistant import router as assistant_router
from app.api.auth import router as auth_router
from app.api.langgraph import router as langgraph_router
from app.core.config import settings
from app.core.exceptions import BaseAppException, InternalServerError
# Import security middleware
from app.core.middleware import (RequestSizeMiddleware,
                                 RequestTimeoutMiddleware,
                                 SecurityHeadersMiddleware,
                                 SecurityLoggingMiddleware,
                                 TrustedProxyMiddleware)
from app.models.error import ErrorDetail, ErrorResponse

# Create FastAPI app
app = FastAPI(
    title="Assistant UI LangGraph Backend",
    description="FastAPI backend for Assistant UI + LangGraph integration with Authentication and Admin",
    version="1.0.0"
)

# Configure logger for exception handlers
logger = logging.getLogger(__name__)


# Global Exception Handlers

@app.exception_handler(BaseAppException)
async def custom_exception_handler(request: Request, exc: BaseAppException) -> JSONResponse:
    """
    Handle custom application exceptions with structured error responses.
    
    This handler catches all custom exceptions that inherit from BaseAppException
    and returns consistent error responses with proper status codes.
    """
    logger.error(
        f"Application exception occurred: {exc.error_code}",
        extra={
            "correlation_id": exc.correlation_id,
            "path": str(request.url),
            "method": request.method,
            "status_code": exc.status_code,
            "error_code": exc.error_code,
            "context": exc.context
        }
    )
    
    error_response = ErrorResponse(
        error=exc.error_code,
        message=exc.message,
        correlation_id=exc.correlation_id,
        timestamp=exc.timestamp,
        status_code=exc.status_code,
        details=exc.context
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump()
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle FastAPI/Pydantic validation errors with detailed field-level error information.
    
    This handler catches validation errors from request parsing and provides
    detailed information about which fields failed validation.
    """
    correlation_id = str(uuid.uuid4())
    
    # Convert Pydantic validation errors to our ErrorDetail format
    validation_errors = []
    for error in exc.errors():
        field_path = " -> ".join(str(loc) for loc in error["loc"]) if error["loc"] else None
        validation_errors.append(ErrorDetail(
            field=field_path,
            message=error["msg"],
            code=error["type"]
        ))
    
    logger.warning(
        f"Validation error occurred",
        extra={
            "correlation_id": correlation_id,
            "path": str(request.url),
            "method": request.method,
            "validation_errors": [
                {"field": err.field, "message": err.message, "code": err.code}
                for err in validation_errors
            ]
        }
    )
    
    error_response = ErrorResponse(
        error="VALIDATION_ERROR",
        message="Request validation failed",
        correlation_id=correlation_id,
        timestamp=datetime.utcnow().isoformat(),
        status_code=422,
        validation_errors=validation_errors
    )
    
    return JSONResponse(
        status_code=422,
        content=error_response.model_dump()
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle FastAPI HTTPExceptions with consistent error formatting.
    
    This ensures that even manually raised HTTPExceptions follow our
    standardized error response format.
    """
    correlation_id = str(uuid.uuid4())
    
    logger.warning(
        f"HTTP exception occurred",
        extra={
            "correlation_id": correlation_id,
            "path": str(request.url),
            "method": request.method,
            "status_code": exc.status_code,
            "detail": str(exc.detail)
        }
    )
    
    error_response = ErrorResponse(
        error="HTTP_ERROR",
        message=str(exc.detail),
        correlation_id=correlation_id,
        timestamp=datetime.utcnow().isoformat(),
        status_code=exc.status_code
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Fallback handler for any unhandled exceptions.
    
    This is the last line of defense to ensure that no unhandled exceptions
    leak sensitive information to clients. All unexpected errors are logged
    with full details but return a generic error response.
    """
    correlation_id = str(uuid.uuid4())
    
    # Log the full exception details for debugging
    logger.error(
        f"Unhandled exception occurred: {type(exc).__name__}",
        extra={
            "correlation_id": correlation_id,
            "path": str(request.url),
            "method": request.method,
            "exception_type": type(exc).__name__,
            "traceback": traceback.format_exc()
        }
    )
    
    # Create a generic internal server error
    internal_error = InternalServerError(
        message="An unexpected error occurred",
        correlation_id=correlation_id
    )
    
    error_response = ErrorResponse(
        error=internal_error.error_code,
        message=internal_error.message,
        correlation_id=internal_error.correlation_id,
        timestamp=internal_error.timestamp,
        status_code=internal_error.status_code
    )
    
    return JSONResponse(
        status_code=internal_error.status_code,
        content=error_response.model_dump()
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Add security middleware (order matters - most specific to most general)
# 1. Trusted proxy handling (must be first to sanitize headers)
app.add_middleware(
    TrustedProxyMiddleware,
    trusted_proxies=[]  # Add trusted proxy IPs here in production
)

# 2. Request size limiting (early rejection of oversized requests)
app.add_middleware(
    RequestSizeMiddleware,
    max_size=10 * 1024 * 1024  # 10MB limit
)

# 3. Security headers (applies to all responses)
app.add_middleware(
    SecurityHeadersMiddleware,
    environment=settings.environment
)

# 4. Request timeout protection
app.add_middleware(
    RequestTimeoutMiddleware,
    timeout=30.0  # 30 seconds
)

# 5. Security logging (should be last to catch everything)
app.add_middleware(SecurityLoggingMiddleware)

# Include routers
app.include_router(auth_router)
app.include_router(assistant_router)
app.include_router(langgraph_router)
app.include_router(admin_router)

@app.get("/")
async def root():
    return {
        "message": "Assistant UI LangGraph Backend with Authentication", 
        "status": "running",
        "environment": settings.environment
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
