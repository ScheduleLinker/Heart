# Step 1:
## Creating a `.env` file to store the api route
 In the `Heart` directory:
  - cd `frontend`
  - create a new called `.env` and paste this:
  - `VITE_BACKEND_URL = "http://localhost:8000"` 

# Step 2:
## Option 1: How To Run Project using Docker-Recommended
   - Make sure Docker is installed on host system
   - In the `Heart` directory,
   - Run: `docker-compose up --build`
   - To stop docker: `docker-compose down`

## Option 2:Manual Start
### How to start Frontend server from the terminal:
 - cd `frontend`
 - run this command `npm run dev`

### How To Initialize And Run The FastAPI Endpoints

1. First you will need to initialize a local python environment in the root directory of the project. Run `python3 -m venv venv` while
   in <b>Heart</b> folder.
2. After initializing the virtual environment, it should create a folder in your directory called <b>venv</b>.
3. Next, if the virtual environment did not activate for you, run `source venv/bin/activate`.
4. In your cli, you should see <b>(venv)</b> at the beginning of the prompt.
5. Then, run `pip install -r requirements.txt`. This will install all the packages necessary to run the project.
6. To run the API, in your console type in `fastapi dev backend/app.py`. This should enable the FastAPI endpoints on port 8000. To see the swagger with all the explanation head to <b>localhost:8000/docs</b>.
### EndPoint:
- **Response 200 OK format**: 
```
{
  "uid": "string",
  "message": "string",
  "status": "string",
  "data": {}
}
```

- A local `storage.json` file is generated to store the parsed contents

![Screenshot from 2025-02-28 21-54-03](https://github.com/user-attachments/assets/31c26de6-e156-4e25-8057-efe9bc03fcf8)

- Result(200 Ok)-`/api/ics-upload`:
```
[
  {
    "uid": "6828e6c7-bfd2-41f6-b9c0-6e4399563162",
    "message": "Ics file uploaded successfully.",
    "status": "Success",
    "data": {
      "events": [
        {
          "summary": "Oral Presentations COM 312 108",
          "description": {
            "CRN": "11827",
            "Credit Hours": "3.0",
            "Level": "Undergraduate",
            "Instructor": "Raufova, Nigora (Primary)"
          },
          "start": "2023-01-19T18:00:00-05:00",
          "end": "2023-01-19T20:50:00-05:00",
          "location": "Campus: Newark Building: Central King Building Room: 214",
          "recurrence": {
            "FREQ": "WEEKLY",
            "UNTIL": "20230511T225900",
            "BYDAY": "TH"
          }
        },
        {
          "summary": "Roadmap to Computing CS 100 012",
          "description": {
            "CRN": "11872",
            "Credit Hours": "3.0",
            "Level": "Undergraduate",
            "Instructor": "Islam, Akm Z (Primary)"
          },
          "start": "2023-01-18T13:00:00-05:00",
          "end": "2023-01-18T14:20:00-05:00",
          "location": "Campus: Newark Building: Central King Building Room: 212",
          "recurrence": {
            "FREQ": "WEEKLY",
            "UNTIL": "20230511T225900",
            "BYDAY": "WE,FR"
          }
        },
        {
          "summary": "Scripting for System Administration IT 240 002",
          "description": {
            "CRN": "14057",
            "Credit Hours": "3.0",
            "Level": "Undergraduate",
            "Instructor": "Vohra, Rosemina A. (Primary)"
          },
          "start": "2023-01-18T10:00:00-05:00",
          "end": "2023-01-18T11:20:00-05:00",
          "location": "Campus: Newark Building: Kupfrian Hall Room: 106",
          "recurrence": {
            "FREQ": "WEEKLY",
            "UNTIL": "20230511T225900",
            "BYDAY": "WE,FR"
          }
        },
        {
          "summary": "Computing &amp; Effective Com YWCC 207 022",
          "description": {
            "CRN": "15662",
            "Credit Hours": "1.0",
            "Level": "Undergraduate",
            "Instructor": "McCormick, Shanna A. (Primary)"
          },
          "start": "2023-01-19T11:30:00-05:00",
          "end": "2023-01-19T12:50:00-05:00",
          "location": "Campus: Newark Building: Central King Building Room: 206",
          "recurrence": {
            "FREQ": "WEEKLY",
            "UNTIL": "20230511T225900",
            "BYDAY": "TH"
          }
        }
      ]
    }
  },
  {
    "uid": "037070f5-3e10-4ca7-af7e-dcd9252912ea",
    "message": "Ics file uploaded successfully.",
    "status": "Success",
    "data": {
      "events": [
        {
          "summary": "Store sell",
          "description": {},
          "start": "2025-02-26T15:00:00+00:00",
          "end": "2025-06-19T02:00:00+00:00",
          "location": "Njit",
          "recurrence": null
        }
      ]
    }
  }
]
```

### How to run backend tests:
1. After initializing the packages, run this command in your console: `pytest backend/tests` to run all of the backend python tests.