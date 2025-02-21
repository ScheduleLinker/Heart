from fastapi import APIRouter, File, UploadFile
from backend.ics_upload.ics_upload_controller import *
#from starlette.responses import JSONResponse

"""
This file contains the logic for handling ICS (iCalendar) file uploads, including validation, parsing, and size checks.
"""


ics_router = APIRouter()


@ics_router.post('/api/ics-upload')
async def ics_upload(ics_file: UploadFile = File(...)) -> UploadResponse:
  print(f"Received file with content_type: {ics_file.content_type}")  # Debugging
  if ics_file.content_type != "text/calendar":
    return  UploadResponse(
      content={"message": IcsUploadMessages.NotAIcs.value},
      status_code=400,
    )
  
  file_content = await ics_file.read()

  # Check file size
  max_file_size = 5 *1024 * 1024 # 5MB limit
  calendar_file = await ics_file.read()
  if len(calendar_file) > max_file_size:
      return UploadResponse(message=IcsUploadMessages.TooLarge, status=Status.Error)

  parse_ics_uid = parse_ics(calendar_file)
  return UploadResponse(uid=parse_ics_uid, message=IcsUploadMessages.IcsUploadSuccess, status=Status.Success)

  
