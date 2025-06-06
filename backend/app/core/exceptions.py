"""
Custom exception classes for the Assistant UI LangGraph Backend.

This module provides specific exception types to replace generic Exception
handling throughout the application, enabling better error handling, logging,
and API responses.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional


class BaseAppException(Exception):
    """
    Base exception class for all application-specific exceptions.
    
    Provides common functionality like correlation IDs, HTTP status codes,
    error context, and structured error messages.
    """
    
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        correlation_id: Optional[str] = None
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or self.__class__.__name__
        self.context = context or {}
        self.correlation_id = correlation_id or str(uuid.uuid4())
        self.timestamp = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for API responses"""
        return {
            "error": {
                "message": self.message,
                "code": self.error_code,
                "status_code": self.status_code,
                "correlation_id": self.correlation_id,
                "timestamp": self.timestamp,
                "context": self.context
            }
        }
    
    def __str__(self) -> str:
        return f"{self.error_code}: {self.message} (ID: {self.correlation_id})"


class ValidationError(BaseAppException):
    """Raised when input validation fails"""
    
    def __init__(
        self,
        message: str = "Validation failed",
        field: Optional[str] = None,
        value: Optional[Any] = None,
        **kwargs
    ):
        context = kwargs.get("context", {})
        if field:
            context["field"] = field
        if value is not None:
            context["invalid_value"] = str(value)
        
        super().__init__(
            message=message,
            status_code=400,
            error_code="VALIDATION_ERROR",
            context=context,
            **{k: v for k, v in kwargs.items() if k != "context"}
        )


class AuthenticationError(BaseAppException):
    """Raised when authentication fails"""
    
    def __init__(
        self,
        message: str = "Authentication failed",
        auth_type: Optional[str] = None,
        **kwargs
    ):
        context = kwargs.get("context", {})
        if auth_type:
            context["auth_type"] = auth_type
        
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR",
            context=context,
            **{k: v for k, v in kwargs.items() if k != "context"}
        )


class AuthorizationError(BaseAppException):
    """Raised when authorization fails (user lacks permissions)"""
    
    def __init__(
        self,
        message: str = "Access denied",
        required_permission: Optional[str] = None,
        **kwargs
    ):
        context = kwargs.get("context", {})
        if required_permission:
            context["required_permission"] = required_permission
        
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR",
            context=context,
            **{k: v for k, v in kwargs.items() if k != "context"}
        )


class ExternalServiceError(BaseAppException):
    """Raised when external service calls fail"""
    
    def __init__(
        self,
        message: str = "External service error",
        service_name: Optional[str] = None,
        service_status_code: Optional[int] = None,
        service_response: Optional[str] = None,
        **kwargs
    ):
        context = kwargs.get("context", {})
        if service_name:
            context["service_name"] = service_name
        if service_status_code:
            context["service_status_code"] = service_status_code
        if service_response:
            context["service_response"] = service_response[:500]  # Truncate long responses
        
        super().__init__(
            message=message,
            status_code=502,
            error_code="EXTERNAL_SERVICE_ERROR",
            context=context,
            **{k: v for k, v in kwargs.items() if k != "context"}
        )


class ConfigurationError(BaseAppException):
    """Raised when configuration is invalid or missing"""
    
    def __init__(
        self,
        message: str = "Configuration error",
        config_key: Optional[str] = None,
        **kwargs
    ):
        context = kwargs.get("context", {})
        if config_key:
            context["config_key"] = config_key
        
        super().__init__(
            message=message,
            status_code=500,
            error_code="CONFIGURATION_ERROR",
            context=context,
            **{k: v for k, v in kwargs.items() if k != "context"}
        )


class DatabaseError(BaseAppException):
    """Raised when database operations fail"""
    
    def __init__(
        self,
        message: str = "Database operation failed",
        operation: Optional[str] = None,
        table: Optional[str] = None,
        **kwargs
    ):
        context = kwargs.get("context", {})
        if operation:
            context["operation"] = operation
        if table:
            context["table"] = table
        
        super().__init__(
            message=message,
            status_code=500,
            error_code="DATABASE_ERROR",
            context=context,
            **{k: v for k, v in kwargs.items() if k != "context"}
        )


class ResourceNotFoundError(BaseAppException):
    """Raised when a requested resource is not found"""
    
    def __init__(
        self,
        message: str = "Resource not found",
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        **kwargs
    ):
        context = kwargs.get("context", {})
        if resource_type:
            context["resource_type"] = resource_type
        if resource_id:
            context["resource_id"] = resource_id
        
        super().__init__(
            message=message,
            status_code=404,
            error_code="RESOURCE_NOT_FOUND",
            context=context,
            **{k: v for k, v in kwargs.items() if k != "context"}
        )


class RateLimitError(BaseAppException):
    """Raised when rate limits are exceeded"""
    
    def __init__(
        self,
        message: str = "Rate limit exceeded",
        limit: Optional[int] = None,
        window: Optional[str] = None,
        **kwargs
    ):
        context = kwargs.get("context", {})
        if limit:
            context["limit"] = limit
        if window:
            context["window"] = window
        
        super().__init__(
            message=message,
            status_code=429,
            error_code="RATE_LIMIT_ERROR",
            context=context,
            **{k: v for k, v in kwargs.items() if k != "context"}
        )


class SecurityError(BaseAppException):
    """Raised when security violations are detected"""
    
    def __init__(
        self,
        message: str = "Security violation detected",
        violation_type: Optional[str] = None,
        **kwargs
    ):
        context = kwargs.get("context", {})
        if violation_type:
            context["violation_type"] = violation_type
        
        super().__init__(
            message=message,
            status_code=400,
            error_code="SECURITY_ERROR",
            context=context,
            **{k: v for k, v in kwargs.items() if k != "context"}
        )


# Convenience aliases for common HTTP errors
class BadRequestError(ValidationError):
    """Alias for ValidationError with 400 status"""


class UnauthorizedError(AuthenticationError):
    """Alias for AuthenticationError with 401 status"""


class ForbiddenError(AuthorizationError):
    """Alias for AuthorizationError with 403 status"""


class NotFoundError(ResourceNotFoundError):
    """Alias for ResourceNotFoundError with 404 status"""


class InternalServerError(BaseAppException):
    """Generic internal server error"""
    
    def __init__(self, message: str = "Internal server error", **kwargs):
        super().__init__(
            message=message,
            status_code=500,
            error_code="INTERNAL_SERVER_ERROR",
            **kwargs
        )


class ServiceUnavailableError(BaseAppException):
    """Raised when a service is temporarily unavailable"""
    
    def __init__(self, message: str = "Service temporarily unavailable", **kwargs):
        super().__init__(
            message=message,
            status_code=503,
            error_code="SERVICE_UNAVAILABLE",
            **kwargs
        ) 