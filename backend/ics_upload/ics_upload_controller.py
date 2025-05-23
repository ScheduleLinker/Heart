from pydantic import BaseModel
from backend.models.enums import *
from icalendar import Calendar
from typing import Optional, List, Tuple
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
    data: dict


class EventDetails(BaseModel):
    summary: str
    description: Optional[dict] = None
    start: str
    end: str
    location: Optional[str] = None
    recurrence: Optional[dict] = None

# Function to parse the ICS file
def parse_ics(ics_file: bytes) -> Tuple[str, dict]:
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
                raw_description = str(component.get("DESCRIPTION", "")).strip()

                raw_rrule = component.get("RRULE", "")
                rrule_str = raw_rrule.to_ical().decode("utf-8") if raw_rrule else ""


                
                event = EventDetails(
                    summary=str(component.get("SUMMARY", "No Title")),
                    description=parse_description(raw_description), # Convert to dict
                    start=component.get("DTSTART").dt.isoformat() if component.get("DTSTART") else "N/A",
                    end=component.get("DTEND").dt.isoformat() if component.get("DTEND") else "N/A",
                    location=str(component.get("LOCATION", "")).strip(),
                    recurrence=parse_recurrence(rrule_str) if rrule_str else None,
                )
                events.append(event.model_dump())

        if not events:
            return "No events found in ICS file.", {}

        # Convert events list to JSON inside "events" key
        #ics_json = json.dumps({"events": events}, indent=4)

        # Store the parsed events in TempStorage
        temp_storage = TempStorage()  # Initialize storage
        ics_uid = temp_storage.create({"events": events})
        
        return ics_uid, {"events": events} # Return dictionary instead of JSON string
    except Exception as e:
        return f"Error parsing ICS file: {str(e)}", {}
    

def parse_description(description_str: str) -> dict:
    """
    Parses the DESCRIPTION field and converts it into a dictionary.
    Expected format: "Key1: Value1\nKey2: Value2\nKey3: Value3"
    """
    description_dict = {}
    lines = description_str.strip().split("\n")

    for line in lines:
        if ": " in line:  # Ensure valid key-value format
            key, value = line.split(": ", 1)  # Split only on first ": "
            description_dict[key.strip()] = value.strip()

    return description_dict

def parse_recurrence(recurrence_str: str) -> dict:
    """
    Parses the RRUle field and coverts it into a dictionary
    Expected format: "FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20251231T235959Z"
    """
    recurrence_dict = {}
    
    # Ensure there's an actual recurrence rule
    if not recurrence_str.strip():
        return recurrence_dict
    
    # Split RRULE into key-value pairs
    parts = recurrence_str.strip().split(";")
    for part in parts:
        if "=" in part:
            key, value = part.split("=", 1)  # Split only at the first "="
            recurrence_dict[key.strip()] = value.strip()

    return recurrence_dict