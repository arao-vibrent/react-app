from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import mysql.connector
import os
import json
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React app's address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SurveyResponse(BaseModel):
    response: dict
    survey_id: int

class SurveyDesign(BaseModel):
    design: dict

class PaginatedResponse(BaseModel):
    surveys: List[dict]
    total: int
    page: int
    total_pages: int

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # SQL file is now always in backend/db
    sql_file_path = os.path.join(os.path.dirname(__file__), 'db', 'responses.sql')
    
    if not os.path.exists(sql_file_path):
        raise FileNotFoundError(f"Could not find responses.sql at {sql_file_path}")
    
    with open(sql_file_path, 'r') as sql_file:
        sql_commands = sql_file.read()
    
    # Split into individual commands and execute each one
    commands = sql_commands.split(';')
    for command in commands:
        command = command.strip()
        if command:
            try:
                cursor.execute(command)
                # Fetch any results to avoid unread result error
                try:
                    cursor.fetchall()
                except:
                    pass
            except Exception as e:
                print(f"Error executing command: {command}")
                print(f"Error: {str(e)}")
                continue
    
    conn.commit()
    cursor.close()
    conn.close()

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "mysql.surveyjs.svc.cluster.local"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", "password"),
        database=os.getenv("MYSQL_DATABASE", "surveydb")
    )

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

@app.post("/responses")
def save_response(survey_response: SurveyResponse, participantId: Optional[int] = Query(None)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO responses (survey_id, response, participant_id) VALUES (%s, %s, %s)",
        (survey_response.survey_id, json.dumps(survey_response.response), participantId)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success"}

@app.get("/responses/{survey_id}")
def get_responses(survey_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM responses WHERE survey_id = %s ORDER BY submitted_at DESC",
        (survey_id,)
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"responses": rows}

@app.get("/surveys", response_model=PaginatedResponse)
def get_surveys(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Base query
    query = "SELECT id, design, created_at, updated_at FROM survey_designs"
    count_query = "SELECT COUNT(*) as total FROM survey_designs"
    params = []
    
    # Add search condition if search term is provided
    if search:
        query += " WHERE LOWER(JSON_EXTRACT(design, '$.title')) LIKE LOWER(%s) OR CAST(id AS CHAR) LIKE %s"
        count_query += " WHERE LOWER(JSON_EXTRACT(design, '$.title')) LIKE LOWER(%s) OR CAST(id AS CHAR) LIKE %s"
        search_param = f"%{search}%"
        params.extend([search_param, search_param])
    
    # Add ordering
    query += " ORDER BY updated_at DESC"
    
    # Add pagination
    query += " LIMIT %s OFFSET %s"
    params.extend([per_page, (page - 1) * per_page])
    
    # Get total count
    cursor.execute(count_query, params[:-2] if search else [])
    total = cursor.fetchone()['total']
    
    # Get paginated results
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "surveys": rows,
        "total": total,
        "page": page,
        "total_pages": total_pages
    }

@app.post("/surveys")
def create_survey(survey: SurveyDesign):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO survey_designs (design) VALUES (%s)",
        (json.dumps(survey.design),)
    )
    survey_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()
    return {"id": survey_id, "status": "success"}

@app.get("/surveys/{survey_id}")
def get_survey(survey_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM survey_designs WHERE id = %s", (survey_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Survey not found")
    return row

@app.put("/surveys/{survey_id}")
def update_survey(survey_id: int, survey: SurveyDesign):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE survey_designs SET design = %s WHERE id = %s",
        (json.dumps(survey.design), survey_id)
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Survey not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success"}

@app.delete("/surveys/{survey_id}")
def delete_survey(survey_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    # First delete associated responses
    cursor.execute("DELETE FROM responses WHERE survey_id = %s", (survey_id,))
    # Then delete the survey
    cursor.execute("DELETE FROM survey_designs WHERE id = %s", (survey_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Survey not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"status": "success"}
