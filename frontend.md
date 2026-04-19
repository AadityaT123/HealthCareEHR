# Frontend Documentation (Comprehensive Analysis)

## 🔹 Project Structure

The frontend is a single-page application built on React 19 and bundled using Vite. It follows a highly modular architecture splitting logic between state, views, routing, and HTTP requests.

```text
frontend/
├── index.html            # Main HTML document entry point injecting React root.
├── vite.config.js        # Vite bundler configuration utilizing @vitejs/plugin-react.
├── jsconfig.json         # Language compiler options indicating module resolutions.
├── eslint.config.js      # Strict linting rules targeting React modern hooks.
├── package.json          # Dependency list containing React, Tailwind, Redux Toolkit, Axios, etc.
└── src/
    ├── App.jsx           # Master Component hosting React Router (<BrowserRouter> + <Routes>).
    ├── App.css           # Global fallback styles.
    ├── index.css         # Tailwind directives and core variables setup.
    ├── main.jsx          # React DOM renderer injecting App into #root.
    ├── api/              # Axios Interceptor classes grouping backend REST fetch endpoints.
    ├── assets/           # Static multimedia imagery components.
    ├── components/       # Granular reusable standard UI components.
    │   ├── layout/       # Structural wrappers building the grid.
    │   └── ui/           # Shared generic aesthetic buttons, inputs, modals.
    ├── pages/            # Core route-entry interface views executing domains.
    └── store/            # Redux Toolkit ecosystem containing states and logic.
        ├── index.js      # Combines slices and configures the Redux Provider store.
        └── slices/       # Thunks and reducers segregated by application features.
```

## 🔹 Components (Complete Coverage)

All shared UI logic is structurally separated. Every generic interface part lives safely inside `src/components/ui/index.jsx`.

### Layout Components (`src/components/layout/`)
- `AppLayout.jsx`: The primary dashboard boundary wrapping the main application logic, restricting paths behind login scopes or layout parameters. Incorporates the Sidebar and Header grids.
- `Header.jsx`: Top navigation toolbar typically rendering global items such as Current User profiles, global commands, and notifications.
- `Sidebar.jsx`: The primary vertical navigator holding links to domain areas like Dashboard, Patients List, Orders.

### UI Generic Components (`src/components/ui/index.jsx`)
- `cn (twMerge/clsx)`: Utility function enabling intelligent class overriding and dynamic condition formatting.
- `Button`: Standardized actionable node handling various states (`primary`, `secondary`, `destructive`, `ghost`).
- `Badge`: Tiny visual status locators (success, info, warning) mapping to clinical contexts.
- `Card`, `CardHeader`, `CardBody`: Structural modular blocks for data grouping utilizing consistent spacing.
- `Spinner`: The system's loading animation indicating pending asynchronous tasks.
- `EmptyState`: Placeholder designs showing when no patient records or notes exist within a view scope.
- `Input`: Connected styled generic text field, tightly bound to handle error states globally mapping to Form hooks.
- `Select`: Connected styled dropdown menu fields.
- `Textarea`: Connected expandable box for extended text capture (Progress Notes etc).
- `Modal`: Fixed overlay dialog box utilized for critical sub-operations preventing navigation away from contexts.
- `statusVariant`: Helper method translating clinical logic strings into specific Badge color patterns (e.g. `'active'` -> `success`).

## 🔹 Pages (Complete Coverage)

Represent large scale independent domains of functionality injected dynamically by the Router:

- `Dashboard.jsx`: Base landing module rendering high-level aggregated data summaries (e.g., upcoming appointments, action queues).
- `PatientsList.jsx`: Registry viewer housing datatables that search, filter, and fetch the generic list of registered patients.
- `PatientDetail.jsx`: Heavily loaded contextual view extracting comprehensive chronologic data about a singular patient by ID parameter (demographics, recent visits).
- `Documentation.jsx`: Workstation module allocated for physicians/nurses to evaluate visits, generating Encounter Notes and Progress Note entries.
- `Orders.jsx`: Management sandbox allowing staff to review and instigate analytical diagnostic tests (Labs, X-Rays, MRIs).
- `Medications.jsx`: Workspace handling drug administrations mapping Prescriptions to MAR metrics preventing misdosage mistakes.

## 🔹 Routing

The system uses `react-router-dom` defined completely inside `src/App.jsx`.

| Route Path | Associated Page Component | Description |
|---|---|---|
| `/` | `<Dashboard />` | Base Index route. Hits the system Dashboard on load. |
| `/patients` | `<PatientsList />` | Displays the master roster of patients. |
| `/patients/:id`| `<PatientDetail />` | Uses the `:id` URL logic to mount the specific patient's profile. |
| `/documentation`| `<Documentation />` | Form environment mapped to generating note records. |
| `/orders` | `<Orders />` | Order generation interface fetching Lab Models. |
| `/medications` | `<Medications />` | Lists active and historical Rx timelines. |
| `/settings` | HTML Placeholder View | Hardcoded string `Settings coming soon.` mapped here dynamically. |
| `*` (Catch-all)| `<Navigate to="/" />` | Immediately redirects 404/broken path occurrences back to index without error screens. |

## 🔹 API Integration (Complete Mapping)

Axios bindings inside `src/api/` completely mask REST fetches from frontend components preventing spaghetti-code vulnerabilities. Interceptions attach JWT tokens mapping precisely to backend models.

**`axiosClient.js`**
- Intercepts all configurations. Standardizes headers uniformly across the application scope.

**`patient.service.js` (Maps `/patients`)**
- `getAllPatients(params)` → GET `/patients`
- `getPatientById(id)` → GET `/patients/:id`
- `createPatient(data)` → POST `/patients`
- `updatePatient(id, data)` → PUT `/patients/:id`
- `deletePatient(id)` → DELETE `/patients/:id`

**`medication.service.js` (Maps `/medications`, `/prescriptions`, `/mar`, `/appointments`)**
- Medication: `getAll()`, `getById()`, `create()`, `update()`, `delete()` 
- Prescription: Identical to Medication CRUD + `getByPatient(id)` → GET `/prescriptions/patient/:id`
- MAR: `getByPatient(id)` → GET `/mar/patient/:id`
- Appointments: `getAll()`, `getByPatient()`, `create()`, `update()`, `delete()`

**`clinical.service.js` (Maps `/encounters`, `/progress-notes`, `/medical-history`)**
- Encounters: Standard CRUD Operations + `getByPatient(id)`
- Progress Notes: Standard CRUD + `getByPatient(id)`
- Medical History: Standard CRUD + `getByPatient(id)`

**`order.service.js` (Maps `/lab-orders`, `/imaging-orders`, `/lab-results`)**
- LabOrders: Standard CRUD parameters + `getByPatient(id)`
- ImagingOrders: Standard CRUD parameters + `cancel(id)` hook mapped to `DELETE /imaging-orders/:id`.
- LabResults: `create()`, `getAll()`, `getByPatient(id)`

## 🔹 State Management

The frontend heavily utilizes modern **Redux Toolkit (`@reduxjs/toolkit`)** eliminating excessive Prop-Drilling and encapsulating external Async-Thunks smoothly. Forms manage isolated inputs natively via **useState / React-Hook-Forms**.

**Store Configured Slices (`src/store/slices/`)**:
- `patientSlice.js`: Contains logic managing active loaded patients (`loading`, `data`, `error`).
- `clinicalSlice.js`: Manages global access contexts towards active encounters, diagnoses, and workflows bridging documentation views.
- `medicationsSlice.js`: Tracks states globally concerning currently dispensed medications, preventing double-prescribing risks dynamically across views.
- `ordersSlice.js`: Tracks pending lab arrays waiting for resolution mappings. 

Each slice generally maps HTTP interactions to variables automatically firing UI loading spins inside React components while resolving promises asynchronously.

## 🔹 UI Flow (Complete User Journey)

1. **Boot**: The system mounts HTML, compiling Vite logic through `main.jsx` initiating Redux state pools via `<Provider>`.
2. **Access Control Context**: Layout wrapping establishes parameters; assuming success, rendering triggers.
3. **Index Path Landing (Dashboard)**: `<Dashboard />` resolves calling concurrent `useEffect` API loops requesting metrics directly from the backend server building interface cards immediately.
4. **General Navigation Menu**: Clinical User clicks "Patients" within `<Sidebar />`. React Router destroys Dashboard hooks safely whilst initializing `<PatientsList />`.
5. **Entity Search & Click Context**: In `PatientsList`, hitting specific generic tables triggers pushing logic directly matching generic Patient IDs (`/patients/34`).
6. **Detailed Load Operation**: `<PatientDetail />` instantiates. This invokes `patient.service.getPatientById(34)`. Redux catches the Promise. `patientSlice` triggers a global "Loading" string. UI `<Spinner>` drops precisely onto the UI DOM blocking clicks.
7. **Resolution rendering**: Axios returns data code `200`. Redux maps patient datasets structurally. The View detects state variation dumping arrays visually directly mapping variables into layout strings.
8. **Modifying Records Workflow**: 
   - A practitioner triggers `<Documentation />`. 
   - Modals or Form fields initialize heavily bound to `react-hook-form` mapping `yup` rules preventing empty saves. 
   - Clicking 'Save' executes asynchronous POST. 
   - Data persists back via Redux mapping to `clinical.service.js` and successfully confirming modifications across views ensuring real-time integrity everywhere.
