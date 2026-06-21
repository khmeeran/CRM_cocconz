# Cocoonz School CRM - Step-by-Step Local Testing Guide

Follow this guide to spin up all systems locally, run database seeding, perform API token testing, execute the complete business workflow test, and verify the frontend pages.

---

## Prerequisites
*   **Python**: Version 3.10+ installed.
*   **Node.js**: Version 18+ installed (with `npm`).
*   **Browser**: Microsoft Edge or Google Chrome (for Selenium verification).
*   **Virtual Environment**: A virtualenv named `venv` in the project root containing all backend dependencies.

---

## Step 1: Environment Setup

1.  **Configure Backend Environment**:
    Check/open **[backend/.env](file:///E:/CRM_Cocoonz/backend/.env)** and ensure the following keys are set:
    ```env
    ENV=development
    DATABASE_URL=sqlite:///E:/CRM_Cocoonz/db/school.db
    ALLOWED_ORIGINS=https://crm-cocoonz.vercel.app,https://cocoonz-school.vercel.app,http://localhost:3000,http://127.0.0.1:3000
    ```

2.  **Configure Frontend Environment**:
    Check/open **[frontend/.env.local](file:///E:/CRM_Cocoonz/frontend/.env.local)** and ensure it points to the IPv4 backend address:
    ```env
    NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
    ```

---

## Step 2: Wiping & Seeding the Database

Run the database setup script to apply database migrations and seed the initial users, branches, classes, and six required fee heads.

```powershell
# In E:\CRM_Cocoonz
venv\Scripts\python.exe setup_dev.py
```

This will output the newly generated passwords and write them to **[backend/admin_initial_password.txt](file:///E:/CRM_Cocoonz/backend/admin_initial_password.txt)**:
```
==================================================
  DEV DATA SEEDED SUCCESSFULLY
  Created Admin Credentials:
  - admin: [generated_password]
  ...
==================================================
```

---

## Step 3: Starting the Servers

To prevent port binding conflicts, ensure no other processes are using port `8000` or `3000`.

1.  **Launch Backend**:
    ```powershell
    cd backend
    ..\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info
    ```
2.  **Launch Frontend**:
    Open a new terminal window:
    ```powershell
    cd frontend
    npm run dev
    ```
    *The frontend will compile and listen on `http://localhost:3000`.*

---

## Step 4: Testing Authentication via Swagger UI

1.  Open your browser and navigate to: **`http://127.0.0.1:8000/docs`**
2.  Locate the **`POST /token`** endpoint.
3.  Click **Try it out** and enter the form details:
    *   `username`: `admin`
    *   `password`: *(Copy the value from `backend/admin_initial_password.txt`)*
4.  Click **Execute**.
5.  **Verify**: You should receive a `200 OK` status with an `access_token` and `role: "Super Admin"` payload.

---

## Step 5: Running the E2E Workflow Test

Run the automated smoke test script to verify calculations (including the 5% Tuition discount logic), partial collections, and outstanding balance tracking. This will also populate mock data in your local database.

```powershell
# Open a new terminal in E:\CRM_Cocoonz
venv\Scripts\python.exe C:\Users\khmee\.gemini\antigravity-cli\brain\89032b76-e432-4b6f-804c-ff3d5e1f7b49\scratch\smoke_test_run.py
```

**Verification Checkpoints**:
*   Verify that `POST /api/students/{id}/assign-fee` applies a **₹1,000.00** discount (5% of ₹20,000.00 Tuition Fee) and sets total payable to **₹27,000.00**.
*   Verify that paying **₹15,000.00** generates a receipt and leaves an outstanding balance of exactly **₹12,000.00**.

---

## Step 6: Capturing Screenshots & Console Logs

Run the browser automation capture script to automatically log in to the system, navigate tabs, select students, view receipts, and take screenshots with DevTools open:

```powershell
# In E:\CRM_Cocoonz
venv\Scripts\python.exe C:\Users\khmee\.gemini\antigravity-cli\brain\89032b76-e432-4b6f-804c-ff3d5e1f7b49\scratch\capture_live_screens.py
```

Screenshots and logs will be output to **`E:\CRM_Cocoonz\docs\screenshots\`**:
*   `actual_desktop_login.png`: Login screen.
*   `actual_desktop_dashboard.png`: Command Center metrics.
*   `actual_desktop_branches.png`: Branch registry.
*   `actual_desktop_students.png`: Admissions Kanban directory.
*   `actual_desktop_fee_assignment.png`: Assigned structures and outstanding dues.
*   `actual_desktop_receipt.png`: Digital receipt details.
*   `browser_console_output.txt`: Logs recorded from the browser tab.

---

## Step 7: Performing Network Reload Health Check

To verify that there are no 500, 404, CORS, or Failed Fetch requests:
1.  Run the verification script:
    ```powershell
    venv\Scripts\python.exe C:\Users\khmee\.gemini\antigravity-cli\brain\89032b76-e432-4b6f-804c-ff3d5e1f7b49\scratch\verify_no_failed_requests.py
    ```
2.  Check the command output:
    ```
    Total SEVERE Network/Fetch errors found: 0
    Total SEVERE Application errors found: 0
    SUCCESS: Verified there are NO 500, 404, CORS, or Failed Fetch requests on reload!
    ```
