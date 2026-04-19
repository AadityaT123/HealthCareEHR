# Backend Documentation (Comprehensive Analysis)

## 🔹 Project Structure

The EHR backend operates on a Node.js + Express framework utilizing PostgreSQL wrapped within Sequelize ORM.

```text
backend/
├── .env                # Runtime environment placeholders
├── .sequelizerc        # Sequelize CLI configuration directives
├── package.json        # Tracks Node.js modules (express, sequelize, helmet, cors etc)
├── docker-compose.yml  # Docker environment container orchestration
└── src/
    ├── server.js       # App Entrypoint. Attaches core middlewares, limiters, and mounts all routes
    ├── config/         # Interacts with variables. (database.js handles new Sequelize() payload)
    ├── controllers/    # Primary business logic bridging routes to models handling res.json()
    ├── integrations/   # Connects the system with external webhooks/APIs
    ├── middlewares/    # Custom interceptors (AuditLog, Global Error Handler, Rate Limiting, Sanitizer)
    ├── models/         # 21 Sequelize Models defining postgres tables and index.js establishing relations.
    ├── routes/         # 18 Modular express routers + portal subset routes
    ├── services/       # Decoupled long-running queue or logic operations
    ├── utils/          # Standardized pagination handlers and boot guards
    └── validators/     # Joi validation schemas governing request structures safely.
```

## 🔹 Database Schema (All Models 100% Coverage)

| Component Model | Field Name | Data Type | Description |
|---|---|---|---|
| **Role** | `id`, `name`, `permissions` | Int, Str, JSONB | Maps roles (Admin, Doctor) to permission trees. |
| **User** | `id`, `email`, `password`, `roleId` | Int, Str, Str, Int (FK) | Master staff accounts linking to RBAC Roles. |
| **Patient** | `id`, `firstName`, `lastName`, `dateOfBirth`, `gender`, `contactInformation`, `insuranceDetails` | Int, Str, Str, Date, Enum, JSONB, JSONB | Deep core demographic and coverage metrics. |
| **Doctor** | `id`, `userId`, `specialty`, `licenseNumber` | Int, Int (FK), Str, Str | Medical Professional link wrapping standard User. |
| **Medication** | `id`, `name`, `dosageForm`, `strength` | Int, Str, Str, Str | Dictionary of prescribable clinical drugs. |
| **MedicalHistory** | `id`, `patientId`, `condition`, `diagnosisDate` | Int, Int (FK), Str, Date | Records chronic or past medical condition logs. |
| **Appointment** | `id`, `patientId`, `doctorId`, `date`, `status` | Int, Int (FK), Int (FK), Date, Enum | Temporal encounters scheduled for evaluation. |
| **EncounterNote** | `id`, `appointmentId`, `patientId`, `doctorId`, `notes` | Int, Int (FK), Int(FK), Int(FK), Text | Primary clinical documentation taken during visits. |
| **Prescription** | `id`, `patientId`, `doctorId`, `medicationId`, `instructions`, `status` | Int, Int (FK), Int(FK), Int(FK), Str, Enum | Active pharmaceutical distribution records. |
| **LabOrder** | `id`, `patientId`, `doctorId`, `testType`, `status` | Int, Int(FK), Int(FK), Str, Enum | Tracks orders demanding external lab analysis. |
| **LabResult** | `id`, `labOrderId`, `resultValues`, `analyzedAt` | Int, Int (FK), JSONB, Date | Outcomes corresponding sequentially to LabOrders. |
| **ProgressNote** | `id`, `patientId`, `doctorId`, `content` | Int, Int(FK), Int(FK), Text | Trackable evolution of ongoing hospital cases. |
| **DocumentTemplate**| `id`, `name`, `content`, `specialty` | Int, Str, Text, Str | Standardized templates to quick-fill encounter fields. |
| **ImagingOrder** | `id`, `patientId`, `doctorId`, `modality` (X-ray, MRI) | Int, Int(FK), Int(FK), Enum | Requisitions for radiological/imaging scans. |
| **MAR** | `id`, `patientId`, `prescriptionId`, `administeredAt` | Int, Int(FK), Int(FK), Date | Medication Administration Record tracking compliance. |
| **MedReconciliation**| `id`, `patientId`, `reconciledBy`, `summary` | Int, Int(FK), Int(FK), Text | Process of cross-verifying active med-lists for safety. |
| **AuditLog** | `id`, `userId`, `action`, `resource`, `ipAddress` | Int, Int(FK), Str, Str, Str | HIPAA compliant unmodifiable metric logger. |
| **PortalUser** | `id`, `patientId`, `email`, `passwordHash` | Int, Int(FK), Str, Str | Sandbox shadow user allowing portal web interactions. |
| **Message** | `id`, `portalUserId`, `staffUserId`, `body`, `read` | Int, Int(FK), Int(FK), Text, Bool | Internal secure messaging gateway text blocks. |
| **NotificationPref**| `id`, `portalUserId`, `emailPrefs`, `smsPrefs` | Int, Int(FK), Bool, Bool | Toggle states deciding ping alerts for users. |

*Note: All tables inherit `createdAt`, `updatedAt`, and mostly `deletedAt` (Paranoid schema).*

## 🔹 API Endpoints (Complete Coverage)

### Core User & Auth Module (`/api/auth`, `/api/roles`)
| Route URL | Method | Description | Params/Query | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|---|
| `/api/auth/register` | POST | Register staff | - | `{ "email": "x", "password": "...", "roleId": 1 }` | `{ "success": true, "user": {} }` | 201, 400 |
| `/api/auth/login` | POST | Login staff | - | `{ "email": "x", "password": "..." }` | `{ "success": true, "token": "jwt...", "user": {} }` | 200, 401 |
| `/api/auth/me` | GET | Check credentials | - | None | `{ "success": true, "data": { "id": 1, "email": "..." } }` | 200 |
| `/api/auth/deactivate/:id`| PUT | Disable user | `id` | None | `{ "success": true, "message": "Deactivated" }` | 200, 404 |
| `/api/roles` | GET | List roles | - | None | `{ "success": true, "data": [{ "name": "Admin" }] }` | 200 |
| `/api/roles/:id` | GET | Role details | `id` | None | `{ "success": true, "data": {} }` | 200, 404 |
| `/api/roles` | POST | Add role | - | `{ "name": "Nurse", "permissions": {} }` | `{ "success": true, "data": {} }` | 201 |
| `/api/roles/:id` | PUT/DEL | Update/Drop role| `id` | `{ "name": "Head Nurse" }` | `{ "success": true }` | 200 |

### Patients & Medical Modules (`/api/patients`, `/api/medical-history`)
| Route URL | Method | Description | Params/Query | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|---|
| `/api/patients` | GET | Get patients | `?page, name, gender` | None | `{ "success": true, "count": 10, "data": [{}] }` | 200 |
| `/api/patients/:id` | GET | Patient detail | `id` | None | `{ "success": true, "data": { "firstName": "John" } }` | 200, 404 |
| `/api/patients` | POST | Create patient | - | `{ "firstName": "A", "lastName": "B", "gender": "Male", ... }`| `{ "success": true, "data": {} }` | 201, 400, 409 |
| `/api/patients/:id` | PUT | Edit patient | `id` | `{ "gender": "Other" }` | `{ "success": true, "data": {} }` | 200 |
| `/api/patients/:id` | DELETE| Hard/Soft drop | `id` | None | `{ "success": true }` | 200 |
| `/api/medical-history` | GET | Get all histories| `?patientId` | None | `{ "success": true, "data": [] }` | 200 |
| `/api/medical-history` | POST | Add history | - | `{ "patientId": 1, "condition": "Asthma" }` | `{ "success": true, "data": {} }` | 201 |

### Clinic Operation Modules (`/api/appointments`, `/api/doctors`, `/api/encounters`, `/api/progress-notes`)
| Route URL | Method | Description | Params/Query | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|---|
| `/api/doctors` | GET/POST | Doctor CRUD | `?specialty` | `{ "userId": 1, "specialty": "ICU" }` | `{ "success": true, "data": [] }` | 200, 201 |
| `/api/appointments` | GET | List appointments| `?doctorId, date`| None | `{ "success": true, "data": [] }` | 200 |
| `/api/appointments` | POST | Schedule visit | - | `{ "patientId": 1, "doctorId": 2, "date": "..." }` | `{ "success": true, "data": {} }` | 201 |
| `/api/appointments/:id/checkout`| PATCH | Complete visit| `id` | None | `{ "success": true }` | 200 |
| `/api/encounters` | GET | List encounters | - | None | `{ "success": true, "data": [] }` | 200 |
| `/api/encounters` | POST | Create note | - | `{ "appointmentId": 1, "notes": "Fever..." }` | `{ "success": true, "data": {} }` | 201 |
| `/api/encounters/:id` | PUT/DEL | Note CRUD | `id` | `{ "notes": "Amended." }` | `{ "success": true }` | 200 |

### Order & Pharmacy Modules (`/api/prescriptions`, `/api/lab-orders`, `/api/lab-results`, `/api/imaging-orders`, `/api/mar`, `/api/medication-reconciliation`)
| Route URL | Method | Description | Params/Query | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|---|
| `/api/prescriptions` | GET/POST | Dictate Rx | - | `{ "medicationId": 12, "instructions": "Daily" }` | `{ "success": true }` | 200, 201 |
| `/api/lab-orders` | GET | Orders List | `?status` | None | `{ "success": true, "data": [] }` | 200 |
| `/api/lab-orders` | POST | Order lab | - | `{ "patientId": 1, "testType": "CBC" }` | `{ "success": true }` | 201 |
| `/api/lab-results` | POST | Write result | - | `{ "labOrderId": 5, "resultValues": {} }` | `{ "success": true }` | 201 |
| `/api/imaging-orders`| GET/POST | MRI/XRay orders| - | `{ "patientId": 1, "modality": "X-Ray" }` | `{ "success": true }` | 200, 201 |
| `/api/mar/missed` | GET | Find missed Rx | - | None | `{ "success": true, "data": [] }` | 200 |
| `/api/mar` | POST | Log dispensing | - | `{ "patientId": 1, "prescriptionId": 2 }` | `{ "success": true }` | 201 |

### Miscellaneous System Modules `/api/templates`, `/api/audit-logs`
| Route URL | Method | Description | Params/Query | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|---|
| `/api/templates` | GET/POST | Create template | - | `{ "name": "SOAP", "content": "..." }` | `{ "success": true }` | 200, 201 |
| `/api/audit-logs` | GET | Fetch events | `?resource` | None | `{ "success": true, "data": [] }` | 200 (Admin) |

### Portal API (`/portal/`)
| Route URL | Method | Description | Params/Query | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|---|
| `/portal/auth/register`| POST | Patient enroll | - | `{ "patientId": 2, "password": "..." }`| `{ "success": true }` | 201 |
| `/portal/auth/login` | POST | Sandbox login | - | `{ "email": "x", "password": "y" }` | `{ "token": "...", "me": {} }` | 200, 401 |
| `/portal/appointments`| GET/POST | Make Appt. | - | `{ "doctorId": 4, "date": "..." }` | `{ "success": true }` | 200, 201 |
| `/portal/messages` | POST | Message Clinic | - | `{ "subject": "Refill", "body": "..." }`| `{ "success": true }` | 201 |
| `/portal/records/export`| GET | Dump history | `?patientId` | None | `(Binary/JSON stream dataset)` | 200 |

## 🔹 Authentication & Security Details
1. **Login/Signup Flow**: Validation blocks payloads hitting `req.body` using Joi schemas. Post validation, Controllers query Sequelize (`User.findOne({ email })`). The plaintext password intercepts `bcrypt.compare`. If validated, a signature encodes against `.env(JWT_SECRET)` issuing a bearer Token block back to the user.
2. **Protected Execution**: Accessing constrained paths (e.g., `/api/patients`) processes through the `protect` middleware first, rejecting bad strings (`401 Unauthorized`).
3. **Authorization (RBAC)**: Heavily utilized within Controllers: `authorize("Admin", "Doctor")` acts redundantly ensuring `req.user.role` matches parameter strings before finalizing execution to preserve systemic separation of duties.

## 🔹 End-To-End Request-Response Flow
*Example walkthrough of fetching `GET /api/patients/12`*
1. **Client**: Frontend Dispatches generic asynchronous fetch invoking `GET /api/patients/12` attaching Authorization Bearer headers.
2. **Global Middlewares (`server.js`)**: Payload penetrates `express.json()`, headers analyzed uniquely by `Helmet`, origins cross-checked with CORS logic, whilst Rate Limit checks frequency count safely mapping tracking details out via global `auditLogMiddleware`.
3. **Route Mapper (`routes/patient.route.js`)**: Express maps `/patients` path, hitting route `/api/patients/:id`.
4. **Local Middleware (`protect`)**: JWT verifies signature. Parses Role ID into `req.user` payload allowing the pipeline continuity.
5. **Controller (`controllers/patient.controller.js`)**: `getPatientById` triggers logically parsing `req.params.id`.
6. **Data Tier (`models/`)**: Function `Patient.findByPk(12)` triggers. Sequelize generates underlying PostgreSQL queries automatically mapping results onto an ORM Javascript object.
7. **Response (`res`)**: The evaluated object translates seamlessly into JSON output executing `res.status(200).json({ success: true, data: dataResolved })` pushing data accurately back to client UI buffers terminating lifecycle successfully.
