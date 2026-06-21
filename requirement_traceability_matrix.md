# Cocoonz School CRM - Requirement Traceability Matrix (RTM)

This matrix maps every functional, structural, and security requirement defined in the **Cocoonz Preschool & School CRM Requirement Document** and **SRS** to the implemented backend and frontend code bases, specific test cases, and live runtime evidence.

---

## 1. Traceability Table

| Req ID | Requirement Description | Backend Implementation | Frontend Implementation | Test Case | Status | Live Evidence / Reference |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **REQ-01** | **Branch Management**: Create, edit, list, and toggle (activate/deactivate) multiple branches. | [models.py:L14](file:///E:/CRM_Cocoonz/backend/models.py#L14)<br>[main.py:L402-L442](file:///E:/CRM_Cocoonz/backend/main.py#L402-L442) | [admin/page.tsx:L283-L352](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L283-L352) | `TC-001` | **PASS** | API: `POST /api/branches` returns `200 OK`. Screenshot: [actual_desktop_branches.png](docs/screenshots/actual_desktop_branches.png) |
| **REQ-02** | **Student Profile & Admission**: Profile fields, status tracking, class allocation, parent details. | [models.py:L94-L118](file:///E:/CRM_Cocoonz/backend/models.py#L94-L118)<br>[main.py:L724-L766](file:///E:/CRM_Cocoonz/backend/main.py#L724-L766) | [admin/page.tsx:L1002-L1190](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L1002-L1190) | `TC-002` | **PASS** | API: `GET /api/students/profile/{id}` returns correct json. Screenshot: [actual_desktop_students.png](docs/screenshots/actual_desktop_students.png) |
| **REQ-03** | **Class Management**: Define classes, sections, and academic year mappings per branch. | [models.py:L31-L47](file:///E:/CRM_Cocoonz/backend/models.py#L31-L47)<br>[main.py:L444-L501](file:///E:/CRM_Cocoonz/backend/main.py#L444-L501) | [admin/page.tsx:L354-L400](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L354-L400) | `TC-003` | **PASS** | API: `POST /api/classes` returns created class mapped to branch. |
| **REQ-04** | **Fee Structure Definition**: Define class-wise and branch-wise fee schedules. | [models.py:L129-L145](file:///E:/CRM_Cocoonz/backend/models.py#L129-L145)<br>[main.py:L675-L722](file:///E:/CRM_Cocoonz/backend/main.py#L675-L722) | [admin/page.tsx:L525-L566](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L525-L566) | `TC-004` | **PASS** | API: `POST /api/fee-structures` maps amount to head and class. |
| **REQ-05** | **Exact Fee Heads**: Supports exactly: Admission Fee, Tuition Fee, Book Fee, Skill Development Charges, After School Activities Fee, Daycare Fee. | [models.py:L119-L128](file:///E:/CRM_Cocoonz/backend/models.py#L119-L128)<br>[setup_dev.py:L91-L102](file:///E:/CRM_Cocoonz/setup_dev.py#L91-L102) | [admin/page.tsx:L218-L226](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L218-L226) | `TC-005` | **PASS** | API: `GET /api/fee-heads` returns the exact whitelisted 6 heads. |
| **REQ-06** | **Fee Type Logic**: 5% discount on *Tuition Fee only* for "Full Fee"; Term-wise dues split into 3 terms. | [main.py:L901-L939](file:///E:/CRM_Cocoonz/backend/main.py#L901-L939) | [admin/page.tsx:L1232-L1244](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L1232-L1244) | `TC-006` | **PASS** | API: `POST /api/students/{id}/assign-fee` returns discount: 1000.00 for 20,000.00 Tuition Fee. Screenshot: [actual_desktop_fee_assignment.png](docs/screenshots/actual_desktop_fee_assignment.png) |
| **REQ-07** | **Admission Workflow**: Enquiry → Registration → Admission → Fee Assignment → Receipt Generation. | [main.py:L402-L650](file:///E:/CRM_Cocoonz/backend/main.py#L402-L650) | [admin/page.tsx:L1000-L1350](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L1000-L1350) | `TC-007` | **PASS** | Status transitions tracked: `Enquiry` -> `Registered` -> `Admitted`. Screenshot: [actual_desktop_students.png](docs/screenshots/actual_desktop_students.png) |
| **REQ-08** | **Collections & Receipts**: Partial payments, head-wise allocation, and receipt breakdown history. | [models.py:L160-L215](file:///E:/CRM_Cocoonz/backend/models.py#L160-L215)<br>[main.py:L608-L670](file:///E:/CRM_Cocoonz/backend/main.py#L608-L670) | [admin/page.tsx:L568-L690](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L568-L690) | `TC-008` | **PASS** | API: `POST /api/collections` returns receipt REC-20260619-AB2052. Screenshot: [actual_desktop_receipt.png](docs/screenshots/actual_desktop_receipt.png) |
| **REQ-09** | **Due Management**: View outstanding balances, unpaid installments, and due dates. | [main.py:L700-L720](file:///E:/CRM_Cocoonz/backend/main.py#L700-L720) | [admin/page.tsx:L1248-L1320](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L1248-L1320) | `TC-009` | **PASS** | API: `GET /api/dues` returns outstanding schedule mapping. |
| **REQ-10** | **Analytics Dashboard**: Collection summary, total dues, admissions, branch performance, trends. | [main.py:L967-L1031](file:///E:/CRM_Cocoonz/backend/main.py#L967-L1031) | [admin/page.tsx:L830-L990](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L830-L990) | `TC-010` | **PASS** | API: `GET /api/dashboard` returns metrics. Screenshot: [actual_desktop_dashboard.png](docs/screenshots/actual_desktop_dashboard.png) |
| **REQ-11** | **Audit Reports**: Daily, monthly, branch-wise collections and outstanding fees. | [main.py:L1033-L1095](file:///E:/CRM_Cocoonz/backend/main.py#L1033-L1095) | [admin/page.tsx:L692-L732](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L692-L732) | `TC-011` | **PASS** | API: `/api/reports/outstanding-fees` returns collection CSV. |
| **REQ-12** | **Due Notifications**: SMS, WhatsApp, and Email abstract logging for reminders. | [services.py:L68-L98](file:///E:/CRM_Cocoonz/backend/services.py#L68-L98)<br>[main.py:L1097-L1130](file:///E:/CRM_Cocoonz/backend/main.py#L1097-L1130) | [admin/page.tsx:L734-L760](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L734-L760) | `TC-012` | **PASS** | API: `/api/notifications/send` logs entry in database table `notifications_log`. |
| **REQ-13** | **Security & Access Control**: Predefined roles (Super Admin, Branch Admin, Accountant, Teacher), audit logs. | [models.py:L48-L93](file:///E:/CRM_Cocoonz/backend/models.py#L48-L93)<br>[main.py:L268-L349](file:///E:/CRM_Cocoonz/backend/main.py#L268-L349)<br>[services.py:L13-L66](file:///E:/CRM_Cocoonz/backend/services.py#L13-L66) | [admin/page.tsx:L762-L784](file:///E:/CRM_Cocoonz/frontend/app/admin/page.tsx#L762-L784) | `TC-013` | **PASS** | API: `/token` returns access token and checks role permissions. Logs recorded in `audit_logs` table. |

---

## 2. Scope & Exclusion Audit

### 2.1 Out-of-Scope Modules (Future Enhancements)
The following modules are explicitly defined as future enhancements in the SRS, and are **NOT** implemented in the current code base to avoid scope creep:
*   **Attendance**: Not implemented.
*   **Transport**: Not implemented.
*   **Payroll**: Not implemented.
*   **Inventory**: Not implemented.
*   **Parent App Portal**: Not implemented.
*   **Learning Management (LMS)**: Not implemented.

---

## 3. RTM Metrics Summary

*   **Total Requirements (In Scope)**: `13`
*   **Passed Count**: `13`
*   **Failed Count**: `0`
*   **Not Implemented Count**: `0`
*   **Partially Implemented Count**: `0`
*   **Exclusions Verified (Out of Scope)**: `6`

**RTM Validation Status**: **100% COMPLETE & PASSING**.
