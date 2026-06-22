# Cocoonz School CRM - Client UAT Guide

This document provides everything you need to test the Cocoonz School CRM system during the User Acceptance Testing (UAT) phase.

──────────────────────────────

## 1. SYSTEM ACCESS

* **Application URL**: `http://localhost:3000` (Local testing) / `https://crm-cocconz.vercel.app` (Production)
* **Login URL**: `http://localhost:3000/login` / `https://crm-cocconz.vercel.app/login`

──────────────────────────────

## 2. TEST ACCOUNTS

The following accounts have been pre-provisioned in the system for testing. 

| Role Name | Username | Temporary Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `Testing@123!` | Full system access, all modules, all branches. |
| **Branch Admin** | `branchadmin` | `Testing@123!` | Access to branch-specific data, admissions, and student management. |
| **Accountant** | `accountant` | `Testing@123!` | Access to Fee Structure, Collections, Receipts, and Dues. |
| **Teacher** | `teacher` | `Testing@123!` | View classes, students, and attendance (view-only financial data). |

──────────────────────────────

## 3. HOW TO TEST

### A. Branch Management
* **Steps**: Log in as `superadmin`. Go to **Branches** from the sidebar.
* **Test**: 
  - Click **New Branch**, fill out the details, and click **Save**.
  - Select an existing branch, click the edit icon (pencil), modify the name, and save.
  - Click the delete icon (trash bin) to delete a test branch.
* **Expected Result**: Branches are created, updated, and removed successfully. Data reflects immediately on the table.

──────────────────────────────

### B. Classes
* **Steps**: Go to **Classes**.
* **Test**: 
  - Click **New Class**, define Name, Section, and Capacity, then save.
  - Edit an existing class.
  - Delete a test class.
* **Expected Result**: The class list updates accurately. The capacity metric reflects correctly.

──────────────────────────────

### C. Admissions
* **Steps**: Go to **Admissions**.
* **Test**: 
  - Click **New Enquiry** and add a candidate's details.
  - Find the candidate in the table. Click **Follow Up** to update their status.
  - Click **Admit** to finalize their enrollment.
* **Expected Result**: Status badges dynamically change. Admitting a student officially creates their profile and generates their fee assignment.

──────────────────────────────

### D. Students
* **Steps**: Go to **Students**.
* **Test**: 
  - View the list of all admitted students. Use the search bar to find a specific roll number.
  - Click the **Edit Profile** icon (✏️) on a student. Update their name and save.
* **Expected Result**: Profile updates seamlessly without requiring a page reload.

──────────────────────────────

### E. Fee Structure
* **Steps**: Log in as `superadmin` or `accountant`. Go to **Fee Structure**.
* **Test**: 
  - Create a new fee structure, link it to a specific class, and define the amount.
  - Assign fees.
* **Expected Result**: The fee is attached to the class and becomes part of the students' outstanding balances.

──────────────────────────────

### F. Collections
* **Steps**: Go to **Collections**.
* **Test**: 
  - Search for a student. View their outstanding balances.
  - Click **Pay Now** on an active fee assignment.
  - Enter a partial payment amount and submit.
* **Expected Result**: The system accepts the payment, reduces the outstanding balance, and generates a receipt number.

──────────────────────────────

### G. Receipts
* **Steps**: Go to **Receipts**.
* **Test**: 
  - View the ledger of generated receipts.
  - Click the **Download** icon on any receipt.
* **Expected Result**: A PDF receipt downloads containing accurate transaction details and branch information.

──────────────────────────────

### H. Dues
* **Steps**: Go to **Dues**.
* **Test**: 
  - Review the summary dashboard (Total Outstanding, Overdue).
  - Use filters to verify specific class dues.
* **Expected Result**: Overdue records are highlighted automatically based on current date vs. due date.

──────────────────────────────

### I. Reports
* **Steps**: Go to **Reports**.
* **Test**: 
  - Switch between Daily, Monthly, and Branch tabs.
  - Click **Export (Soon)** to test the limits of the demo.
* **Expected Result**: High-level financial reporting generates dynamically based on date selections.

──────────────────────────────

## 4. KNOWN LIMITATIONS

* **Export Functionality**: Some bulk CSV export buttons are currently disabled marked with `(Soon)` as they are scheduled for Phase 2.
* **Filter Functionality**: Advanced filtering on Users and Notifications is currently disabled marked with `(Soon)`.
* **SMS/WhatsApp Integration**: The `Notifications` module successfully queues messages in the database and dispatches Celery tasks, but the actual Twilio/Meta APIs are bypassed in this UAT environment to prevent spam. 
* **Database Resets**: The `school.db` is configured with a nightly rollback in the test environment to keep data fresh.

──────────────────────────────

## 5. SUPPORT CONTACT

* **Technical Contact**: Khader (Lead Developer)
* **Escalation Contact**: Khader 
* **Support Email**: dev@cocoonz.com

──────────────────────────────

## 6. EVIDENCE

*Verification screenshots confirming successful login and dashboard access for each role are attached in the delivery email.*
