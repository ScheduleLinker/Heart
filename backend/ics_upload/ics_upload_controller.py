from typing import Optional
from pydantic import BaseModel
from backend.models.enums import *
from ics import Calendar
from pydantic import BaseModel

"""
This file defines the FastAPI router and endpoint for handling ICS file uploads.
"""

class UploadResponse(BaseModel):
    uid: str
    message: str
    status: str


class EventDetails(BaseModel):
    summary: str
    description: Optional[str] = None
    start: str
    end: str
    location: Optional[str] = None

# Function to validate the ICS file
def validate_ics_upload(ics_file: str) -> UploadResponse:
    """
    Validates the uploaded ICS file.

    Args:
        ics_file (str): The content of the ICS file as a string.

    Returns:
        UploadResponse: A response indicating the validation status.
    """
    try:
        # Attempt to parse the ICS file
        Calendar(ics_file)
        return UploadResponse(
            uid="validation_uid",  # Replace with a unique ID if needed
            message=IcsUploadMessages.IcsUploadSuccess,
            status=Status.Success
        )
    except Exception as e:
        return UploadResponse(
            uid="validation_uid",  # Replace with a unique ID if needed
            message=f"{IcsUploadMessages.IcsUploadError}: {str(e)}",
            status=Status.Error
        )

def parse_ics(ics_file: str):
    """
    Parses an ICS file and extracts event details.
    """
    try:
        calendar = Calendar(ics_file)
        events = [
            EventDetails(
                summary=event.name,
                description=event.description,
                start=str(event.begin),
                end=str(event.end),
                location=event.location
            )
            for event in calendar.events
        ]
        return events
    except Exception as e:
        return f"Error parsing ICS file: {str(e)}"


def check_ics_size(ics_file: bytes) -> UploadResponse:
    """
    Checks if the ICS file size is within the allowed limit (5MB).

    Args:
        ics_file (bytes): The content of the ICS file as bytes.

    Returns:
        UploadResponse: A response indicating the size check status.
    """
    max_file_size = 5 * 1024 * 1024  # 5MB limit
    if len(ics_file) > max_file_size:
        return UploadResponse(
            uid="size_check_uid",  # Replace with a unique ID if needed
            message=IcsUploadMessages.IcsFileTooLarge,
            status=Status.Error
        )
    return UploadResponse(
        uid="size_check_uid",  # Replace with a unique ID if needed
        message="ICS file size is within the allowed limit.",
        status=Status.Success
    )