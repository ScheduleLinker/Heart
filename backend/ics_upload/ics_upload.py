from fastapi import APIRouter, File, UploadFile
from ics_upload_controller import *
from starlette.responses import JSONResponse

"""
This file contains the logic for handling ICS (iCalendar) file uploads, including validation, parsing, and size checks.
"""


ics_router = APIRouter()


@ics_router.post('api/ics-upload')
async def ics_upload(ics_file: UploadFile = File(...)) -> UploadResponse:
  if ics_file.content_type != "text/calender":
    return  JSONResponse(
      content={"message": IcsUploadMessages.NotAIcs.value},
      status_code=400,
    )
  
  file_content = await ics_file.read()

  # Check file size
  size_check = check_ics_size(file_content)
  if size_check.status == Status.Error:
      return JSONResponse(content=size_check.dict(), status_code=400)

  # Validate ICS content
  validation_response = validate_ics_upload(file_content.decode("utf-8"))
  if validation_response.status == Status.Error:
      return JSONResponse(content=validation_response.dict(), status_code=400)

  return JSONResponse(content=validation_response.dict(), status_code=200)
  
