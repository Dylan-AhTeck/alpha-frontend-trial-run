"""
Error response models for consistent API error formatting.
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    """Individual error detail for validation errors"""
    field: Optional[str] = None
    message: str
    code: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standardized error response format for all API endpoints"""
    
    success: bool = False
    error: str
    message: str
    correlation_id: str
    timestamp: str
    status_code: int
    details: Optional[Dict[str, Any]] = None
    validation_errors: Optional[list[ErrorDetail]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "error": "VALIDATION_ERROR",
                "message": "Invalid email format",
                "correlation_id": "550e8400-e29b-41d4-a716-446655440000",
                "timestamp": "2024-01-01T12:00:00Z",
                "status_code": 400,
                "details": {
                    "field": "email",
                    "invalid_value": "not-an-email"
                },
                "validation_errors": [
                    {
                        "field": "email",
                        "message": "Invalid email format",
                        "code": "INVALID_FORMAT"
                    }
                ]
            }
        } 