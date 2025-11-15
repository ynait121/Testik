"""
Templates Routes
Готовые шаблоны workflow
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter()


class TemplateResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    definition: Dict[str, Any]
    thumbnail: Optional[str]
    rating: float
    usageCount: int
    isPublic: bool


@router.get("/", response_model=List[TemplateResponse])
async def list_templates(
    category: Optional[str] = None,
    search: Optional[str] = None,
):
    """List templates"""
    # TODO: Implement with database
    return []


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str):
    """Get template by ID"""
    # TODO: Implement with database
    raise HTTPException(status_code=404, detail="Template not found")


@router.post("/{template_id}/use")
async def use_template(template_id: str, projectId: str):
    """Create workflow from template"""
    # TODO: Implement template usage
    return {"workflowId": "wf_123"}
