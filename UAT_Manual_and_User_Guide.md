# Cocoonz School CRM - UAT Manual & User Guide

Welcome to the Cocoonz School CRM User Acceptance Testing (UAT) phase. This document provides everything you need to log in, exercise the system, verify client workflows, and troubleshoot local environment issues.

---

## 1. Test Credentials

The database has been seeded with standard roles to test the multi-tenant branch isolation and RBAC.

| Role | Username / Email | Password | Branch | Access Level |
|------|------------------|----------|--------|-------------|
| **Super Admin** | `principal_admin` | `password123` | *Global (All)* | Full System Access |
| **Branch Admin** | `test_office` | `password123` | Cocoonz Main | Branch config, Admissions, basic reporting |
| **Accountant** | `test_accountant` | `password123` | Cocoonz Main | Fee collection, Payroll, financial reports |
| **Teacher** | `test_teacher` | `password123` | Cocoonz Main | View students, basic lists |

*Note: These accounts were generated during the initial `e2e_rbac_test.py` and `test_rbac.py` seeding phases, and subsequently linked to the newly created default branch.*

---

## 2. Seed Data Summary

To prevent you from having to create everything from scratch, the local database currently contains the following demo data:

- **Branches:** 1 (`Cocoonz Main` created by `backfill_branch.py`)
- **Classes:** 1 (Standard Grade used for E2E tests)
- **Fee Heads:** 4 (Admission Fee, Tuition Fee, Book Fee, Uniform Fee)
- **Fee Structures:** 6 mapping definitions
- **Students:** 7 (Created via `e2e_admission_test.py`)
- **Parents:** 7 (Linked to students)
- **Staff:** 1 (`Test Staff` created by E2E smoke tests)
- **Salary Payments:** 1 (Demonstrating the new Net Salary logic)
- **Fee Payment History:** 1 (Demonstrating partial/full fee collection)

---

## 3. Complete User Guide

### A. Initial Login
1. Open `http://localhost:3000` in your browser.
2. The UI will prompt for login. 
3. Use `principal_admin` / `password123`.
4. The system securely sets an `HttpOnly` cookie for your session and redirects you to the Dashboard.

### B. Super Admin Walkthrough
As Super Admin, you are responsible for setting up the global infrastructure.

1. **Creating a Branch**: Navigate to Branches -> Add Branch. Fill in the name and location.
2. **Creating an Academic Year**: (Currently implicitly handled by date-scoping in the UI/reports).
3. **Creating Classes**: Navigate to Academic -> Classes -> Add Class. (e.g., "LKG", "UKG").
4. **Creating Fee Heads**: Handled natively (Admission, Tuition, Book, Uniform). If you need more, you can technically add them via API `POST /api/fee-heads`.
5. **Creating Fee Structures**: Navigate to Fees -> Structures. Link a Fee Head to a Class with a specified Amount and Term (e.g., Tuition Fee for LKG = ₹1000/month).
6. **Creating Users & Assigning Roles**: Navigate to User Management. Create a new user, specify their Role (e.g., ACCOUNTANT) and assign them to a specific Branch from the dropdown.

### C. Office Staff (Branch Admin) Walkthrough
Log out, then log in as `test_office`. You will only see data for "Cocoonz Main".

1. **Student Admission**: 
   - Navigate to Admissions -> New Admission.
   - Enter Student Details and Parent Details.
   - Select the Class. The system automatically fetches the mapped Fee Structures.
   - Submit. Server-side pricing assigns the correct fee liabilities.
2. **Managing Staff**:
   - Navigate to HR / Staff. 
   - Click "Add Staff". Fill out Name, Role, Phone, Email, Qualification, Address, and Salary.
3. **Viewing Reports**: You have access to non-financial summaries like the `Class-wise Report` to see student distribution.

### D. Accountant Walkthrough
Log out, then log in as `test_accountant`.

1. **Fee Collection**:
   - Navigate to Fees -> Collect. Search for a student.
   - You will see their Outstanding Fees.
   - Enter the collection amount. The system accepts Partial Payments and updates the `balance_due`.
2. **Discounts**: Discounts are automatically calculated and applied upon admission for "Full Fee" preferences on discountable heads (Tuition Fee).
3. **Receipt Printing**: After collection, click "Print Receipt" to download the PDF invoice.
4. **Salary Payment**:
   - Navigate to Payroll. Select a Staff member.
   - Enter the Basic Amount, Bonus, Advance, and Deductions.
   - Submit. The system calculates Net Payout and auto-posts it to the General Ledger as an EXPENSE.
5. **Financial Reports**: Navigate to Reports to generate Daily Collections, Monthly Collections, Outstanding Reports, and Discount Reports.

### E. Teacher Walkthrough
Log out, then log in as `test_teacher`.

1. **Student Access**: Navigate to Students. You can view basic profiles but cannot edit fees, collect money, or see payroll.
2. **Reports**: Access is highly restricted.

### F. Logout & Session Handling
- Click the **Logout** button in the UI (or hit `POST /api/logout`).
- The server responds by explicitly instructing the browser to delete the `HttpOnly` access token cookie.
- If you attempt to use the back button to view protected data, the API will return `401 Unauthorized`.

---

## 4. Testing Checklist

Print or copy this checklist to track your UAT progress:

- [ ] Run `launch.bat` successfully without errors.
- [ ] Login as `principal_admin`.
- [ ] Dashboard loads with valid metrics.
- [ ] Create a new Branch.
- [ ] Create a new Class.
- [ ] Verify Fee Heads exist.
- [ ] Create a new Student (Admission).
- [ ] Verify Parent was auto-created.
- [ ] Verify Fees were assigned correctly.
- [ ] Logout and Login as `test_accountant`.
- [ ] Collect Fees for the new student.
- [ ] Print PDF Receipt.
- [ ] Add a new Staff member (ensure Email, Qualification, Address, DOJ are present).
- [ ] Pay Salary (Test Bonus and Deductions).
- [ ] Generate Class-wise Report.
- [ ] Generate Discount Report.
- [ ] Logout.
- [ ] Login as `test_office` and verify you cannot see Payroll.
- [ ] Close command window (`launch.bat`) to stop server.
- [ ] Run `launch.bat` again and verify all created data persisted.

---

## 5. Known Limitations

In the interest of full transparency, the following limitations exist in the current build:

- **Third-Party Notifications**: The Broadcast/Notification engine creates internal ledger records but does **not** actually send physical SMS/WhatsApp messages. (Requires live vendor credentials like Twilio/Msg91).
- **Academic Year Switching**: The schema natively uses `date` fields for everything. Hard-isolation of historical academic years via a dropdown toggle is not fully polished in the UI.
- **Dynamic Fee Head UI**: The API supports creating custom Fee Heads (`POST /api/fee-heads`), but the frontend UI screen for it may not be fully wired up. The pre-seeded ones (Admission, Tuition, Book, Uniform) are guaranteed to work.

---

## 6. Quick Troubleshooting Guide

**1. Backend not starting / Docker issues:**
- *Symptom:* `docker-compose up` fails.
- *Solution:* Ensure Docker Desktop is running. Run `docker-compose down -v` to clear zombie containers, then try `launch.bat` again.

**2. Port Conflicts (8000 or 3000):**
- *Symptom:* Address already in use.
- *Solution:* Check if another instance of Node or Python/Uvicorn is running. Use Task Manager to kill `node.exe` or `python.exe`.

**3. Missing `.env` / Database connection fails:**
- *Symptom:* 500 Internal Server Error immediately on login.
- *Solution:* The Docker container uses internal network resolution (`db`), but ensure the backend `.env` has the correct `POSTGRES_USER` and `SECRET_KEY`.

**4. Frontend not loading / API calls failing:**
- *Symptom:* UI says "Network Error".
- *Solution:* Check that `NEXT_PUBLIC_API_URL` in `frontend/.env.local` is set to `http://localhost:8000`.

**5. Login problems (401 Unauthorized):**
- *Symptom:* Invalid credentials.
- *Solution:* Remember the password is `password123`. If the database was accidentally wiped, you must run `docker exec crm_cocoonz-backend-1 python seed_admin.py` (ensure you create that script).

**6. Database Migration Failures:**
- *Symptom:* `alembic upgrade head` errors out in the `launch.bat` logs.
- *Solution:* Usually caused by dirty local state. Stop docker, delete the `db` volume or `test_crm.db`, and let docker-compose recreate the Postgres instance fresh.
