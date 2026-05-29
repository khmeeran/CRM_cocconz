import sqlite3
import uuid
from datetime import date, timedelta
import random
from passlib.context import CryptContext

db_path = "E:/CRM_Cocoonz/db/school.db"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

BOY_NAMES = ["Aditya", "Arjun", "Karthik", "Sanjay", "Vijay", "Rahul", "Naveen", "Prakash", "Suresh", "Ramesh", "Manoj", "Kiran", "Dinesh", "Senthil", "Murugan", "Ganesh", "Vishnu", "Shiva", "Balaji", "Anand"]
GIRL_NAMES = ["Anitha", "Priya", "Divya", "Sangeetha", "Lakshmi", "Saranya", "Kavita", "Deepa", "Ramya", "Meena", "Ishwarya", "Swetha", "Nandhini", "Sindhu", "Pavithra", "Gayathri", "Bhavani", "Janani", "Preethi", "Sneha"]
SURNAMES = ["Kumar", "Rajan", "Sivam", "Nathan", "Moorthy", "Babu", "Chander", "Prasad", "Varadhan", "Gopal", "Sundar", "Mani", "Velu", "Arasu", "Dass"]

def setup():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Wipe everything
    tables = ['attendance', 'fees_summary', 'payment_history', 'students', 'parents', 'classes', 'staff', 'staff_attendance', 'salary_payments', 'general_ledger', 'broadcasts', 'users', 'time_table', 'bus_trips', 'proxy_assignments']
    for t in tables:
        try:
            cursor.execute(f"DELETE FROM {t}")
        except sqlite3.OperationalError:
            pass # Table might not exist yet

    # 1.5 Add Admin
    admin_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)",
                   (admin_id, "admin", pwd_context.hash("password123"), "ADMIN"))

    # 2. Add Classes
    classes = [
        (str(uuid.uuid4()), "Pre-KG", "A"),
        (str(uuid.uuid4()), "LKG", "A"),
        (str(uuid.uuid4()), "UKG", "A"),
        (str(uuid.uuid4()), "1st Std", "A"),
        (str(uuid.uuid4()), "1st Std", "B"),
        (str(uuid.uuid4()), "2nd Std", "A"),
        (str(uuid.uuid4()), "3rd Std", "A"),
        (str(uuid.uuid4()), "4th Std", "A"),
        (str(uuid.uuid4()), "5th Std", "A")
    ]
    cursor.executemany("INSERT INTO classes (id, name, section) VALUES (?, ?, ?)", classes)

    # 3. Add Staff
    staff_roles = [('Anitha Kumari', 'TEACHER', 28000), ('Ramesh Babu', 'OFFICE', 20000), ('Suresh Velu', 'DRIVER', 15000), ('Priya Rajan', 'TEACHER', 26000), ('Karthik Sivam', 'TEACHER', 27000), ('Manikandan', 'PEON', 12000)]
    staff_ids = []
    for name, role, sal in staff_roles:
        s_id = str(uuid.uuid4())
        staff_ids.append(s_id)
        cursor.execute("INSERT INTO staff (id, name, role, phone, monthly_salary, joining_date) VALUES (?, ?, ?, ?, ?, ?)", 
                       (s_id, name, role, f"+9198400{random.randint(10000,99999)}", sal, "2025-01-01"))

    # 4. Add Parents and Students (120 Students)
    student_ids = []
    used_phones = set()
    for c_id, c_name, sec in classes:
        for i in range(1, 16): # 15 per class
            p_id = str(uuid.uuid4())
            primary_phone = f"+9172009{random.randint(10000,99999)}"
            while primary_phone in used_phones:
                primary_phone = f"+9172009{random.randint(10000,99999)}"
            used_phones.add(primary_phone)
            
            surname = random.choice(SURNAMES)
            father_name = f"Mr. {random.choice(BOY_NAMES)} {surname}"
            mother_name = f"Mrs. {random.choice(GIRL_NAMES)} {surname}"
            
            cursor.execute("INSERT INTO parents (id, father_name, mother_name, primary_phone, secondary_phone, address) VALUES (?,?,?,?,?,?)",
                           (p_id, father_name, mother_name, primary_phone, "+919000000000", f"{i}, School Lane, Chennai"))
            
            s_id = str(uuid.uuid4())
            student_ids.append(s_id)
            
            first_name = random.choice(BOY_NAMES + GIRL_NAMES)
            student_name = f"{first_name} {surname}"
            
            cursor.execute("INSERT INTO students (id, name, roll_no, class_id, parent_id, status) VALUES (?,?,?,?,?,?)",
                           (s_id, student_name, f"{c_name[0]}{sec}{i:02d}", c_id, p_id, "ACTIVE"))
            
            # Fee Summary
            total = 25000
            paid = random.choice([5000, 10000, 15000, 25000])
            due_date_val = (date.today() + timedelta(days=random.randint(-20, 10))).isoformat()
            
            cursor.execute("INSERT INTO fees_summary (student_id, total_amount, paid_amount, pending_balance, next_due_date) VALUES (?,?,?,?,?)",
                           (s_id, total, paid, total - paid, due_date_val))
            
            # Add some fee history
            if paid > 0:
                h_id = str(uuid.uuid4())
                cursor.execute("INSERT INTO payment_history (id, student_id, amount, payment_date, payment_mode, receipt_no) VALUES (?,?,?,?,?,?)",
                               (h_id, s_id, paid, date.today().isoformat(), 'UPI', f'REC-{random.randint(1000,9999)}'))
                # Log to Ledger
                cursor.execute("INSERT INTO general_ledger (id, transaction_type, category, amount, description, date, reference_id) VALUES (?,?,?,?,?,?,?)",
                               (str(uuid.uuid4()), 'INCOME', 'FEE', paid, f"Fee from {student_name}", date.today().isoformat(), h_id))

    # 5. Add Attendance History (Last 7 Days)
    today = date.today()
    for d_offset in range(7):
        curr_date = today - timedelta(days=d_offset)
        if curr_date.weekday() == 6: continue # Skip Sundays
        
        # Student Attendance
        for s_id in student_ids:
            status = 'P' if random.random() > 0.1 else 'A' # 90% attendance
            cursor.execute("INSERT INTO attendance (id, student_id, date, status) VALUES (?,?,?,?)",
                           (str(uuid.uuid4()), s_id, curr_date.isoformat(), status))
        
        # Staff Attendance
        for st_id in staff_ids:
            status = 'P' if random.random() > 0.05 else 'A'
            cursor.execute("INSERT INTO staff_attendance (id, staff_id, date, status) VALUES (?,?,?,?)",
                           (str(uuid.uuid4()), st_id, curr_date.isoformat(), status))

    # 6. Random Expenses
    expenses = [('Electricity Bill', 4500, 'UTILITY'), ('Water Supply', 1200, 'UTILITY'), ('Stationery Purchase', 3000, 'SUPPLIES'), ('Internet Bill', 1500, 'UTILITY'), ('New Desk Repair', 2500, 'OTHER')]
    for desc, amt, cat in expenses:
        cursor.execute("INSERT INTO general_ledger (id, transaction_type, category, amount, description, date) VALUES (?,?,?,?,?,?)",
                       (str(uuid.uuid4()), 'EXPENSE', cat, amt, desc, date.today().isoformat()))

    # 7. Add TimeTable for all classes
    subjects = ['English', 'Tamil', 'Maths', 'Science', 'Social', 'PT', 'Computer', 'Art']
    days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    
    # Get class and teacher ids
    cursor.execute("SELECT id FROM classes")
    db_class_ids = [r[0] for r in cursor.fetchall()]
    cursor.execute("SELECT id FROM staff WHERE role='TEACHER'")
    db_teacher_ids = [r[0] for r in cursor.fetchall()]

    timetable_entries = []
    for c_id in db_class_ids:
        for day in days:
            for period in range(1, 7): # 6 periods per day
                timetable_entries.append((
                    str(uuid.uuid4()),
                    c_id,
                    random.choice(db_teacher_ids),
                    day,
                    period,
                    random.choice(subjects)
                ))
    cursor.executemany("INSERT INTO time_table (id, class_id, teacher_id, day_of_week, period_number, subject) VALUES (?,?,?,?,?,?)", timetable_entries)

    # 8. Add Bus Fleet
    buses = [
        (str(uuid.uuid4()), 'TN-01-AX-1234', 'Suresh Velu', 'IDLE', None, date.today().isoformat()),
        (str(uuid.uuid4()), 'TN-01-BY-5678', 'Manikandan', 'IDLE', None, date.today().isoformat()),
        (str(uuid.uuid4()), 'TN-01-CZ-9012', 'Velu Sundar', 'IDLE', None, date.today().isoformat())
    ]
    cursor.executemany("INSERT INTO bus_trips (id, bus_no, driver_name, status, current_location, last_updated) VALUES (?,?,?,?,?,?)", buses)

    conn.commit()
    conn.close()
    print("Simulation: High-traffic busy school data with realistic names seeded successfully.")

if __name__ == "__main__":
    setup()

if __name__ == "__main__":
    setup()
