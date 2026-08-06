import csv, os, datetime
from data.database import Database

def import_students_from_csv(path):
    db = Database()
    added = 0
    errors = []
    with open(path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, start=1):
            sid = row.get("student_id") or row.get("id") or row.get("Student ID")
            name = row.get("name") or row.get("Name")
            cls = row.get("class_section") or row.get("class") or ""
            roll = row.get("roll_no") or row.get("roll") or ""
            if not sid or not name:
                errors.append((i, "Missing student_id or name"))
                continue
            res = db.add_student(sid, name, cls, roll)
            if res == "OK":
                added += 1
            else:
                errors.append((i, res))
    return {"added": added, "errors": errors}
