from fastapi import APIRouter, File, UploadFile
from backend.ics_upload.ics_upload_controller import *
from backend.models.enums import IcsUploadMessages, Status

"""
This file contains the logic for handling ICS (iCalendar) file uploads, including validation, parsing, and size checks.
"""

ics_router = APIRouter()

@ics_router.post('/api/ics-upload')
async def ics_upload(ics_files: List[UploadFile] = File(...)) -> List[UploadResponse]:
    responses = []

    for i, ics_file in enumerate(ics_files):
        print(f"Received file {i+1}: {ics_file.filename} with content_type: {ics_file.content_type}")  # Debugging

        if ics_file.content_type != "text/calendar":
            response = UploadResponse(
                uid="",
                message=IcsUploadMessages.NotAIcs.value,
                status=Status.Error.value,
                data={}
            )
            print(response)
            return [response.model_dump()]

        # Read file content once
        file_content = await ics_file.read()

        # Check file size (5MB limit)
        max_file_size = 5 * 1024 * 1024
        if len(file_content) > max_file_size:
            response = UploadResponse(
                uid="",
                message=IcsUploadMessages.TooLarge.value,
                status=Status.Error.value,
                data={}
            )
            return [response.model_dump()]

        # Parse ICS file and store in temp storage
        parse_ics_uid, ics_json = parse_ics(file_content)
        
        response = UploadResponse(
            uid=parse_ics_uid,
            message=IcsUploadMessages.IcsUploadSuccess.value,
            status=Status.Success.value,
            data=ics_json
        )

        print(f"Parsed file {i+1}: {ics_file.filename}")
        responses.append(response)
    return responses