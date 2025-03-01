from pydantic import BaseModel
from backend.models.enums import *
from icalendar import Calendar
from typing import Optional, List
from backend.models.temp_storage import TempStorage
from io import BytesIO
import json

"""
This file defines the FastAPI router and endpoint for handling ICS file uploads.
"""

class UploadResponse(BaseModel):
    uid: str
    message: str
    status: str
    json: str


class EventDetails(BaseModel):
    summary: str
    description: Optional[str] = None
    start: str
    end: str
    location: Optional[str] = None

# Function to parse the ICS file
def parse_ics(ics_file: bytes) -> str:
    """
    Parses an ICS file and extracts event details.
    Handles multiple calendars and stores events in TempStorage.
    """
    try:
        # Read ICS content from bytes
        calendar = Calendar.from_ical(BytesIO(ics_file).read())

        events: List[dict] = []
        for component in calendar.walk():
            if component.name == "VEVENT":
                event = EventDetails(
                    summary=str(component.get("SUMMARY", "No Title")),
                    description=str(component.get("DESCRIPTION", "")).strip(),
                    start=component.get("DTSTART").dt.isoformat() if component.get("DTSTART") else "N/A",
                    end=component.get("DTEND").dt.isoformat() if component.get("DTEND") else "N/A",
                    location=str(component.get("LOCATION", "")).strip(),
                )
                events.append(event.model_dump())

        if not events:
            return "No events found in ICS file."

        #convert ics to json
        ics_json = json.dumps(events, indent=4)

        # Store the parsed events in TempStorage
        temp_storage = TempStorage()  # Initialize storage
        ics_uid = temp_storage.create({"events": events})
        return ics_uid, ics_json

    except Exception as e:
        return f"Error parsing ICS file: {str(e)}"