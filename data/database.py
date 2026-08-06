import sqlite3, os, datetime

class Database:
    def __init__(self, db_path=None):
        base = os.path.join(os.getcwd(), "data")
        os.makedirs(base, exist_ok=True)
        self.db_path = db_path or os.path.join(base, "attendance.db")
        self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._ensure_tables()

    def _ensure_tables(self):
        cur = self._conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS students (
                student_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                class_section TEXT,
                roll_no TEXT,
                date_added TEXT,
                email TEXT,
                phone TEXT,
                parent_contact TEXT
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS attendance (
                attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT,
                date TEXT,
                status TEXT,
                timestamp TEXT,
                arrival_time TEXT,
                departure_time TEXT,
                notes TEXT,
                UNIQUE(student_id, date)
            )
            """
        )
        # Add new columns to existing tables if they don't exist
        try:
            cur.execute("ALTER TABLE students ADD COLUMN email TEXT")
        except:
            pass
        try:
            cur.execute("ALTER TABLE students ADD COLUMN phone TEXT")
        except:
            pass
        try:
            cur.execute("ALTER TABLE students ADD COLUMN parent_contact TEXT")
        except:
            pass
        try:
            cur.execute("ALTER TABLE attendance ADD COLUMN arrival_time TEXT")
        except:
            pass
        try:
            cur.execute("ALTER TABLE attendance ADD COLUMN departure_time TEXT")
        except:
            pass
        try:
            cur.execute("ALTER TABLE attendance ADD COLUMN notes TEXT")
        except:
            pass
        self._conn.commit()

    # Student operations
    def add_student(self, student_id, name, class_section="", roll_no=""):
        try:
            cur = self._conn.cursor()
            cur.execute("INSERT INTO students (student_id, name, class_section, roll_no, date_added) VALUES (?, ?, ?, ?, ?)",
                        (student_id, name, class_section, roll_no, datetime.datetime.now().isoformat()))
            self._conn.commit()
            return "OK"
        except sqlite3.IntegrityError:
            return "Duplicate student ID"
        except Exception as e:
            return str(e)

    def get_all_students(self):
        cur = self._conn.cursor()
        cur.execute("SELECT student_id, name, class_section, roll_no, date_added FROM students ORDER BY name")
        rows = cur.fetchall()
        return [tuple(r) for r in rows]

    def delete_student(self, student_id):
        cur = self._conn.cursor()
        cur.execute("DELETE FROM students WHERE student_id = ?", (student_id,))
        cur.execute("DELETE FROM attendance WHERE student_id = ?", (student_id,))
        self._conn.commit()

    def count_students(self):
        cur = self._conn.cursor()
        cur.execute("SELECT COUNT(*) as c FROM students")
        return cur.fetchone()["c"]

    # Attendance operations
    def set_attendance(self, student_id, date, status):
        ts = datetime.datetime.now().isoformat()
        cur = self._conn.cursor()
        try:
            cur.execute("INSERT OR REPLACE INTO attendance (student_id, date, status, timestamp) VALUES (?, ?, ?, ?)",
                        (student_id, date, status, ts))
            self._conn.commit()
        except Exception as e:
            raise

    def get_attendance_status(self, student_id, date):
        cur = self._conn.cursor()
        cur.execute("SELECT status FROM attendance WHERE student_id = ? AND date = ?", (student_id, date))
        r = cur.fetchone()
        return r["status"] if r else None

    def get_attendance_by_date(self, date):
        cur = self._conn.cursor()
        cur.execute("""
            SELECT a.student_id, s.name, a.status, a.timestamp, a.arrival_time, a.departure_time, a.notes
            FROM attendance a
            LEFT JOIN students s ON s.student_id = a.student_id
            WHERE a.date = ?
            ORDER BY s.name
        """, (date,))
        rows = cur.fetchall()
        return [tuple(r) for r in rows]

    # Analytics and reporting methods
    def get_attendance_statistics(self, start_date=None, end_date=None, class_section=None):
        cur = self._conn.cursor()
        where_clause = "WHERE 1=1"
        params = []
        
        if start_date:
            where_clause += " AND a.date >= ?"
            params.append(start_date)
        if end_date:
            where_clause += " AND a.date <= ?"
            params.append(end_date)
        if class_section:
            where_clause += " AND s.class_section = ?"
            params.append(class_section)
            
        cur.execute(f"""
            SELECT 
                s.student_id,
                s.name,
                s.class_section,
                COUNT(a.attendance_id) as total_days,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) as late_days,
                ROUND(SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.attendance_id), 2) as attendance_percentage
            FROM students s
            LEFT JOIN attendance a ON s.student_id = a.student_id {where_clause}
            GROUP BY s.student_id, s.name, s.class_section
            ORDER BY attendance_percentage DESC, s.name
        """, params)
        rows = cur.fetchall()
        return [tuple(r) for r in rows]

    def get_daily_attendance_summary(self, date):
        cur = self._conn.cursor()
        cur.execute("""
            SELECT 
                COUNT(*) as total_students,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) as late_count
            FROM students s
            LEFT JOIN attendance a ON s.student_id = a.student_id AND a.date = ?
        """, (date,))
        return cur.fetchone()

    def get_attendance_trends(self, student_id, days=30):
        cur = self._conn.cursor()
        cur.execute("""
            SELECT date, status, arrival_time
            FROM attendance 
            WHERE student_id = ? 
            ORDER BY date DESC 
            LIMIT ?
        """, (student_id, days))
        rows = cur.fetchall()
        return [tuple(r) for r in rows]

    def get_late_students(self, date, late_threshold="09:00"):
        cur = self._conn.cursor()
        cur.execute("""
            SELECT a.student_id, s.name, a.arrival_time, a.status
            FROM attendance a
            JOIN students s ON s.student_id = a.student_id
            WHERE a.date = ? AND a.status = 'Late' AND a.arrival_time > ?
            ORDER BY a.arrival_time
        """, (date, late_threshold))
        rows = cur.fetchall()
        return [tuple(r) for r in rows]

    def get_attendance_by_date_range(self, start_date, end_date):
        cur = self._conn.cursor()
        cur.execute("""
            SELECT a.date, 
                   COUNT(*) as total_students,
                   SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count,
                   SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
                   SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) as late_count
            FROM attendance a
            WHERE a.date BETWEEN ? AND ?
            GROUP BY a.date
            ORDER BY a.date
        """, (start_date, end_date))
        rows = cur.fetchall()
        return [tuple(r) for r in rows]

    def update_student_info(self, student_id, name=None, class_section=None, roll_no=None, email=None, phone=None, parent_contact=None):
        cur = self._conn.cursor()
        updates = []
        params = []
        
        if name is not None:
            updates.append("name = ?")
            params.append(name)
        if class_section is not None:
            updates.append("class_section = ?")
            params.append(class_section)
        if roll_no is not None:
            updates.append("roll_no = ?")
            params.append(roll_no)
        if email is not None:
            updates.append("email = ?")
            params.append(email)
        if phone is not None:
            updates.append("phone = ?")
            params.append(phone)
        if parent_contact is not None:
            updates.append("parent_contact = ?")
            params.append(parent_contact)
            
        if updates:
            params.append(student_id)
            cur.execute(f"UPDATE students SET {', '.join(updates)} WHERE student_id = ?", params)
            self._conn.commit()
            return "OK"
        return "No updates provided"

    def set_attendance_with_details(self, student_id, date, status, arrival_time=None, departure_time=None, notes=None):
        ts = datetime.datetime.now().isoformat()
        cur = self._conn.cursor()
        try:
            cur.execute("""
                INSERT OR REPLACE INTO attendance 
                (student_id, date, status, timestamp, arrival_time, departure_time, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (student_id, date, status, ts, arrival_time, departure_time, notes))
            self._conn.commit()
        except Exception as e:
            raise
