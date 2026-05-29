# Project Overview: Cocoonz OS
**The Next-Gen School Operating System**

Cocoonz OS is a high-performance, integrated School Management System (ERP) designed to automate daily operations, secure institutional data, and provide real-time intelligence for school leadership. Built with a focus on speed, scale, and ease of use, it replaces fragmented manual processes with a single "Command Center."

---

## 1. Core System Architecture
*   **Intelligence Backend:** Powered by FastAPI (Python) for ultra-fast API response times and asynchronous handling of high-traffic data.
*   **Security Layer:** Industry-standard JWT (JSON Web Token) authentication with encrypted password hashing.
*   **Dynamic UI:** A modern, mobile-responsive dashboard using Tailwind CSS and vanilla JS for a zero-lag user experience.
*   **Persistent Storage:** SQLite database optimized with Write-Ahead Logging (WAL) for concurrent data integrity.

---

## 2. Key Functional Modules

### 📊 Intelligence Dashboard
*   **Real-time Metrics:** Instant visibility into total student count, daily attendance percentage, and pending liquidity (fees).
*   **Role-Adaptive UI:** The dashboard interface automatically reconfigures itself based on the permissions of the logged-in user.

### 💰 Fee Management Center
*   **Automated Ledger:** Every fee payment is automatically logged into the school’s General Ledger.
*   **Nudge System:** Intelligent tracking of dues with "Friendly," "Firm," and "Strict" urgency levels based on overdue days.
*   **Receipt Generation:** Secure tracking of payment modes (UPI, Cash, Bank) with unique receipt referencing.

### 📝 Smart Attendance & Academic Records
*   **Bulk Processing:** Teachers can mark entire classes in seconds via a streamlined mobile interface.
*   **PTM Profiles:** A unique "Parent Confrontation Fix" profile that shows a 30-day attendance trend and payment discipline score to handle parent meetings effectively.
*   **Unified Records:** Centralized access to student health, parent contacts, and status tracking.

### 👥 Staff & Operations Hub
*   **Staff Management:** Complete database of teachers, drivers, and office staff.
*   **Salary Automation:** One-click salary processing with automated expense logging to the finance hub.
*   **Proxy Pilot:** Intelligent teacher substitution system that identifies available teachers for a specific period to cover for absent staff.

### 🚛 Live Transport Pulse
*   **Fleet Tracking:** Monitor the real-time status of school buses (Idle, En Route, Completed).
*   **Broadcast Integration:** Capabilities to trigger location-based alerts to parents when a bus is en route.

### ⚖️ Finance Hub (The Digital Vault)
*   **General Ledger:** A transparent record of every rupee in (Incomes) and out (Expenses).
*   **Profit Analytics:** Automated calculation of school profitability and utility spending (Electricity, Water, Supplies).

---

## 3. Strict Security & Access Control (RBAC)
The system operates on a **Strict Zero-Trust Model**. Access is defined by four specific roles to ensure no one sees data they aren't authorized to handle:

| Role | Access Permissions | Restricted From |
| :--- | :--- | :--- |
| **Admin** | Full System Control, User Management, Global Finance | Nothing |
| **Teacher** | Attendance, Student Records, Bus Status, Timetables | Fees, Salaries, Accounting, User Creation |
| **Office Staff** | Admissions, Staff Attendance, Transport, Proxy Assignment | High-level Finance Stats, Salaries, User Creation |
| **Accountant** | Fee Collection, General Ledger, Staff Salaries, Records | Attendance Marking, Transport Tracking, Proxy Pilot |

---

## 4. Why Cocoonz OS?
1.  **Eliminate Human Error:** Automated cross-posting between modules (e.g., Fees -> Ledger).
2.  **Data Sovereignty:** Localized database ensures the school owns and controls its data without third-party cloud dependencies.
3.  **Speed:** Designed to run on standard school hardware while maintaining enterprise-grade response speeds.
4.  **Audit Ready:** Transparent financial logs ensure the school is always ready for internal or external audits.

---
*© 2026 Cocoonz Intelligence Systems. Designed for Scale.*
