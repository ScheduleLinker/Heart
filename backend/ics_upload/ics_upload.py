from fastapi import APIRouter
from ics import Calendar
ics_router = APIRouter


@ics_router.post('api/ics-upload')
async def ics_upload(ics_file: UploadFile = File(...)) -> UploadResponse:
  if ics_file.content_type 