"""
Security middleware for FastAPI application.

This module provides comprehensive security middleware including:
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Request size limits and timeout protection
- Security logging for suspicious requests
- Rate limiting protection
"""

import ipaddress
import logging
import time
from typing import Dict, List, Optional

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all HTTP responses.
    
    Implements security best practices including:
    - HSTS (HTTP Strict Transport Security)
    - CSP (Content Security Policy)
    - X-Frame-Options (Clickjacking protection)
    - X-Content-Type-Options (MIME type sniffing protection)
    - X-XSS-Protection (XSS protection)
    - Referrer-Policy (Referrer information control)
    - Permissions-Policy (Feature policy)
    """
    
    def __init__(self, app: ASGIApp, environment: str = "development"):
        super().__init__(app)
        self.environment = environment
        self.security_headers = self._get_security_headers()
    
    def _get_security_headers(self) -> Dict[str, str]:
        """Generate security headers based on environment"""
        headers = {
            # Prevent MIME type sniffing
            "X-Content-Type-Options": "nosniff",
            
            # Prevent clickjacking
            "X-Frame-Options": "DENY",
            
            # XSS protection (legacy browsers)
            "X-XSS-Protection": "1; mode=block",
            
            # Control referrer information
            "Referrer-Policy": "strict-origin-when-cross-origin",
            
            # Disable potentially dangerous browser features
            "Permissions-Policy": (
                "geolocation=(), "
                "microphone=(), "
                "camera=(), "
                "payment=(), "
                "usb=(), "
                "magnetometer=(), "
                "gyroscope=(), "
                "speaker=()"
            ),
            
            # Content Security Policy
            "Content-Security-Policy": self._get_csp_policy(),
            
            # Remove server information
            "Server": "Assistant-API",
        }
        
        # Add HSTS for production HTTPS
        if self.environment == "production":
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        return headers
    
    def _get_csp_policy(self) -> str:
        """Generate Content Security Policy based on environment"""
        if self.environment == "development":
            # More permissive CSP for development
            return (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "connect-src 'self' ws: wss: http: https:; "
                "font-src 'self' data:; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self';"
            )
        else:
            # Strict CSP for production
            return (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self'; "
                "img-src 'self' data:; "
                "connect-src 'self'; "
                "font-src 'self'; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "frame-ancestors 'none';"
            )
    
    async def dispatch(self, request: Request, call_next):
        """Process request and add security headers to response"""
        # Process the request
        response = await call_next(request)
        
        # Add security headers to all responses
        for header_name, header_value in self.security_headers.items():
            response.headers[header_name] = header_value
        
        return response


class RequestSizeMiddleware(BaseHTTPMiddleware):
    """
    Middleware to limit request size and protect against large payload attacks.
    """
    
    def __init__(self, app: ASGIApp, max_size: int = 10 * 1024 * 1024):  # 10MB default
        super().__init__(app)
        self.max_size = max_size
    
    async def dispatch(self, request: Request, call_next):
        """Check request size before processing"""
        content_length_str = request.headers.get("content-length")
        
        if content_length_str:
            content_length = int(content_length_str)
            if content_length > self.max_size:
                logger.warning(
                    f"Request size too large: {content_length} bytes",
                    extra={
                        "client_ip": request.client.host if request.client else "unknown",
                        "user_agent": request.headers.get("user-agent"),
                        "path": str(request.url.path),
                        "content_length": content_length,
                        "max_allowed": self.max_size
                    }
                )
                # Import here to avoid circular import
                from app.core.exceptions import SecurityError
                raise SecurityError(
                    message=f"Request body too large. Maximum size: {self.max_size // (1024*1024)}MB",
                    context={"max_size_mb": self.max_size // (1024*1024)}
                )
        
        response = await call_next(request)
        return response


class RequestTimeoutMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add request processing timeout protection.
    """
    
    def __init__(self, app: ASGIApp, timeout: float = 30.0):  # 30 seconds default
        super().__init__(app)
        self.timeout = timeout
    
    async def dispatch(self, request: Request, call_next):
        """Process request with timeout protection"""
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # Log slow requests
            processing_time = time.time() - start_time
            if processing_time > self.timeout * 0.8:  # Log when 80% of timeout reached
                logger.warning(
                    f"Slow request detected: {processing_time:.2f}s",
                    extra={
                        "client_ip": request.client.host if request.client else "unknown",
                        "path": str(request.url.path),
                        "method": request.method,
                        "processing_time": processing_time,
                        "timeout_threshold": self.timeout
                    }
                )
            
            return response
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(
                f"Request failed after {processing_time:.2f}s",
                extra={
                    "client_ip": request.client.host if request.client else "unknown",
                    "path": str(request.url.path),
                    "method": request.method,
                    "processing_time": processing_time,
                    "error": str(e)
                }
            )
            raise


class SecurityLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for security-focused logging and suspicious request detection.
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.suspicious_patterns = [
            # Common attack patterns
            "script>", "<iframe", "javascript:", "vbscript:",
            "onload=", "onerror=", "onclick=", 
            # SQL injection patterns
            "union select", "drop table", "insert into",
            # Path traversal
            "../", "..\\", "%2e%2e",
            # Command injection
            "; cat ", "| cat ", "&& cat ",
        ]
        
        self.suspicious_headers = [
            "x-forwarded-for", "x-real-ip", "x-originating-ip"
        ]
    
    def _is_suspicious_request(self, request: Request) -> tuple[bool, List[str]]:
        """Check if request contains suspicious patterns"""
        suspicious_indicators = []
        
        # Check URL for suspicious patterns
        url_str = str(request.url).lower()
        for pattern in self.suspicious_patterns:
            if pattern in url_str:
                suspicious_indicators.append(f"URL contains: {pattern}")
        
        # Check headers for suspicious content
        for header_name, header_value in request.headers.items():
            header_value_lower = header_value.lower()
            for pattern in self.suspicious_patterns:
                if pattern in header_value_lower:
                    suspicious_indicators.append(f"Header {header_name} contains: {pattern}")
        
        # Check for suspicious header combinations
        forwarded_headers = [h for h in self.suspicious_headers if h in request.headers]
        if len(forwarded_headers) > 1:
            suspicious_indicators.append(f"Multiple forwarding headers: {forwarded_headers}")
        
        # Check for unusually long headers
        for header_name, header_value in request.headers.items():
            if len(header_value) > 1000:
                suspicious_indicators.append(f"Unusually long header: {header_name}")
        
        return len(suspicious_indicators) > 0, suspicious_indicators
    
    def _get_client_info(self, request: Request) -> Dict[str, str]:
        """Extract client information for logging"""
        return {
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown"),
            "referer": request.headers.get("referer", "none"),
            "forwarded_for": request.headers.get("x-forwarded-for", "none"),
            "real_ip": request.headers.get("x-real-ip", "none"),
        }
    
    async def dispatch(self, request: Request, call_next):
        """Log security-relevant request information"""
        start_time = time.time()
        client_info = self._get_client_info(request)
        
        # Check for suspicious patterns
        is_suspicious, indicators = self._is_suspicious_request(request)
        
        if is_suspicious:
            logger.warning(
                f"Suspicious request detected",
                extra={
                    "path": str(request.url.path),
                    "method": request.method,
                    "indicators": indicators,
                    **client_info
                }
            )
        
        # Process request
        try:
            response = await call_next(request)
            processing_time = time.time() - start_time
            
            # Log successful requests
            logger.info(
                f"Request processed",
                extra={
                    "path": str(request.url.path),
                    "method": request.method,
                    "status_code": response.status_code,
                    "processing_time": round(processing_time, 3),
                    "suspicious": is_suspicious,
                    **client_info
                }
            )
            
            return response
            
        except Exception as e:
            processing_time = time.time() - start_time
            
            logger.error(
                f"Request failed",
                extra={
                    "path": str(request.url.path),
                    "method": request.method,
                    "error": str(e),
                    "processing_time": round(processing_time, 3),
                    "suspicious": is_suspicious,
                    **client_info
                }
            )
            raise


class TrustedProxyMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle trusted proxy headers safely.
    Only processes forwarding headers from trusted proxy IPs.
    """
    
    def __init__(self, app: ASGIApp, trusted_proxies: Optional[List[str]] = None):
        super().__init__(app)
        self.trusted_proxies = trusted_proxies or []
        self.trusted_networks = []
        
        # Convert IP addresses to network objects for efficient checking
        for proxy in self.trusted_proxies:
            try:
                self.trusted_networks.append(ipaddress.ip_network(proxy, strict=False))
            except ValueError:
                logger.warning(f"Invalid trusted proxy IP/network: {proxy}")
    
    def _is_trusted_proxy(self, client_ip: str) -> bool:
        """Check if client IP is from a trusted proxy"""
        if not self.trusted_networks:
            return False
        
        try:
            client_addr = ipaddress.ip_address(client_ip)
            return any(client_addr in network for network in self.trusted_networks)
        except ValueError:
            return False
    
    async def dispatch(self, request: Request, call_next):
        """Process proxy headers only from trusted sources"""
        if request.client:
            client_ip = request.client.host
            
            # Only process forwarding headers from trusted proxies
            if not self._is_trusted_proxy(client_ip):
                # Remove potentially spoofed forwarding headers from untrusted sources
                headers_to_remove = ["x-forwarded-for", "x-real-ip", "x-forwarded-proto"]
                for header in headers_to_remove:
                    if header in request.headers:
                        logger.warning(
                            f"Removing untrusted forwarding header: {header}",
                            extra={"client_ip": client_ip, "header": header}
                        )
        
        response = await call_next(request)
        return response 