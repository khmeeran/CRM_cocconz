# Cocoonz School CRM - Live Browser Local Verification Evidence

This report contains actual runtime evidence and logs captured from the running application on **localhost:3000** and **127.0.0.1:8000** on **June 19, 2026**. 

---

## 1. Live Browser Network Interception & Console Output

### 1.1 Live `/token` Login Request Network Details
*   **Request URL**: `POST http://127.0.0.1:8000/token`
*   **Request Headers**:
    ```http
    Content-Type: application/x-www-form-urlencoded
    ```
*   **Request Payload**:
    ```http
    username=admin&password=vw8ApWgNpILCydkq
    ```
*   **HTTP Response Status**: `200 OK`
*   **Response Headers**:
    ```json
    {
      "date": "Fri, 19 Jun 2026 05:27:41 GMT",
      "server": "uvicorn",
      "content-length": "186",
      "content-type": "application/json",
      "set-cookie": "access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Max-Age=28800; Path=/; SameSite=lax",
      "x-request-id": "a03896006b9944b7bdba26732db56fa7",
      "connection": "close"
    }
    ```
*   **Response Body Payload**:
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc4MTg3NTY2Mn0.ViSfP_synCey287ZOkweNUscSFX0eUfUA3vxI3eD-xI",
      "token_type": "bearer",
      "role": "Super Admin"
    }
    ```

---

### 1.2 Live Browser Console Output
Console logs captured from the running application window showing clean operations (no application errors):
```text
[WARNING] devtools://devtools/bundled/ui/components/helpers/helpers.js 0:375 "<DevTools deprecation warning> components/helpers: CustomElements.defineComponent is deprecated."
[WARNING] devtools://devtools/bundled/ui/components/helpers/helpers.js 0:375 "<DevTools deprecation warning> components/helpers: CustomElements.defineComponent is deprecated."
[WARNING] devtools://devtools/bundled/ui/components/helpers/helpers.js 0:375 "<DevTools deprecation warning> components/helpers: CustomElements.defineComponent is deprecated."
[WARNING] devtools://devtools/bundled/ui/components/helpers/helpers.js 0:375 "<DevTools deprecation warning> components/helpers: CustomElements.defineComponent is deprecated."
[SEVERE] devtools://devtools/bundled/Images/edge-run_command.svg - Failed to load resource: net::ERR_FAILED
[SEVERE] devtools://devtools/bundled/panels/edge_welcome/edge_welcome.js 1:2841 "Failed to fetch icon: devtools://devtools/bundled/Images/edge-run_command.svg\nTypeError: Failed to fetch"
```

---

## 2. Backend Hotfixes Implemented

During browser integration testing, two critical backend bugs were identified and fixed in **[main.py](file:///E:/CRM_Cocoonz/backend/main.py)**:

1.  **Student `fees` AttributeError**:
    *   *Issue*: Querying `/api/students` attempted a `joinedload(models.Student.fees)`. Since `Student` model has no relationship `fees` (it has `fee_mapping`), the endpoint crashed with a 500 error, presenting as a CORS error in the browser.
    *   *Fix*: Removed the invalid join load and legacy serialization fallbacks.
2.  **Integrity Error on Re-assignment**:
    *   *Issue*: The frontend calls `POST /api/students/{id}/assign-fee` when selecting a student. Wiping the old mapping and dues on re-selection caused `sqlite3.IntegrityError: NOT NULL constraint failed: collections.student_fee_due_id` because existing collections/receipts referenced those dues.
    *   *Fix*: Modified the endpoint to check for an existing assignment and return it directly, protecting database integrity.

---

## 3. Reload Verification & Network Health Check

As part of the final acceptance checklist, the Dashboard was reloaded while monitoring the browser's Network and Console logs.

### 3.1 Network Health Audit Summary
*   **Failed fetches**: `0`
*   **CORS errors**: `0`
*   **500 Internal Server Errors**: `0`
*   **404 Not Found Errors**: `0`

All backend calls returned HTTP `200 OK` (confirmed in backend uvicorn terminal logs).

---

## 4. Actual Live Screenshots Evidence

The screenshots below show the browser window with the **address bar showing localhost:3000** and **DevTools open** in MS Edge.

### 4.1 Login Page
![Actual Login Page](docs/screenshots/actual_desktop_login.png)

### 4.2 Reloaded Dashboard View
Captures the dashboard loaded cleanly with 0 errors on reload:
![Actual Reloaded Dashboard](docs/screenshots/actual_desktop_reloaded_dashboard.png)

### 4.3 Branch Management
![Actual Branch Page](docs/screenshots/actual_desktop_branches.png)

### 4.4 Student Admission Workflow (Student Directory)
![Actual Student Directory](docs/screenshots/actual_desktop_students.png)

### 4.5 Fee Structure & Discount Assignment (Assign & Collect)
Shows student selected, billing details, and outstanding schedule:
![Actual Fee Assignment](docs/screenshots/actual_desktop_fee_assignment.png)

### 4.6 Receipt Breakdown (Receipt History)
Displays detailed receipt allocations:
![Actual Receipt Page](docs/screenshots/actual_desktop_receipt.png)

---

**Acceptance Status**: Verified. All pages render dynamically from the active codebase. Port connections and CORS rules are correct.
