from pydantic import BaseModel
from typing import TypeVar, Generic, Optional, Any

T = TypeVar("T")

class BaseResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Success"
    data: Optional[T] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str

def success_response(data: Any = None, message: str = "Success") -> dict:
    return {
        "success": True,
        "message": message,
        "data": data if data is not None else {}
    }

def error_response(message: str = "Error") -> dict:
    return {
        "success": False,
        "message": message
    }
