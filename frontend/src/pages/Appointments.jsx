import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAppointments, createAppointment, updateAppointment, cancelAppointment,
} from "../store/slices/appointmentSlice";
import { fetchPatients } from "../store/slices/patientSlice";
import { fetchDoctors } from "../store/slices/doctorSlice";
import { CalendarDays, Plus, Search, Clock, User, X, CalendarPlus } from "lucide-react";
import {
  PageHeader, Button, Card, CardBody, Modal,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, EmptyState, Alert, statusVariant,
} from "../components/ui";
import { format, parseISO } from "date-fns";

const APPOINTMENT_TYPES = ["Consultation", "Follow-up", "Emergency", "Routine Check-up"];
const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled", "No-Show"];
const EMPTY_FORM = {
  patientId: "", doctorId: "", appointmentDate: "", appointmentTime: "",
  appointmentType: "Consultation", status: "Scheduled", notes: "",
};

// Shared field classes
const F = "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400";
const FTA = "flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none";
const LBL = "text-xs font-semibold text-slate-700";

// Custom status badge — white bg, coloured text + border, subtle shadow
const STATUS_STYLE = {
  Scheduled:  { color: '#3b82f6', border: '#bfdbfe', bg: '#ffffff' },
  Completed:  { color: '#16a34a', border: '#bbf7d0', bg: '#ffffff' },
  Cancelled:  { color: '#dc2626', border: '#fecaca', bg: '#ffffff' },
  'No-Show':  { color: '#d97706', border: '#fde68a', bg: '#ffffff' },
};

const ApptStatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || { color: '#64748b', border: '#e2e8f0', bg: '#ffffff' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '9999px',
      fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.01em',
      backgroundColor: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      {status || 'Scheduled'}
    </span>
  );
};

const Appointments = () => {
  const dispatch = useDispatch();
  const { list: appointments, loading, saving, error } = useSelector((s) => s.appointments);
  const { list: patients } = useSelector((s) => s.patients);
  const { list: doctors } = useSelector((s) => s.doctors);

  const [search, setSearch] = useState("");
  const [statusFlt, setStatusFlt] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
  }, [dispatch]);

  const filtered = appointments.filter((a) => {
    const pat = patients.find((p) => String(p.id) === String(a.patientId));
    const patName = pat ? `${pat.firstName} ${pat.lastName}`.toLowerCase() : "";
    const matchSearch = !search || patName.includes(search.toLowerCase()) || (a.notes || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFlt || a.status === statusFlt;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setForm(EMPTY_FORM); setFormErr(""); setEditAppt(null); setAddOpen(true);
    setTimeout(() => document.getElementById("appt-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const openEdit = (appt) => {
    setEditAppt(appt);
    const dateOnly = appt.appointmentDate ? appt.appointmentDate.split("T")[0] : "";
    const timeOnly = appt.appointmentDate?.includes("T") ? appt.appointmentDate.split("T")[1]?.substring(0, 5) : "";
    setForm({
      patientId: String(appt.patientId || ""), doctorId: String(appt.doctorId || ""),
      appointmentDate: dateOnly, appointmentTime: timeOnly,
      appointmentType: appt.appointmentType || "Consultation",
      status: appt.status || "Scheduled", notes: appt.notes || "",
    });
    setFormErr(""); setAddOpen(true);
  };

  const buildPayload = () => ({
    patientId: Number(form.patientId),
    doctorId:  Number(form.doctorId),
    appointmentDate: form.appointmentTime
      ? `${form.appointmentDate}T${form.appointmentTime}:00`
      : `${form.appointmentDate}T08:00:00`,
    appointmentType: form.appointmentType,
    status: form.status,
    notes:  form.notes,
    reason: form.notes || '',   // backend validator expects 'reason'
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormErr("");
    if (!form.patientId) { setFormErr("Patient is required."); return; }
    if (!form.doctorId) { setFormErr("Doctor is required."); return; }
    if (!form.appointmentDate) { setFormErr("Appointment date is required."); return; }
    const action = editAppt ? updateAppointment({ id: editAppt.id, data: buildPayload() }) : createAppointment(buildPayload());
    const result = await dispatch(action);
    const fulfilled = editAppt ? updateAppointment.fulfilled.match(result) : createAppointment.fulfilled.match(result);
    if (fulfilled) {
      setSuccess(editAppt ? "Appointment updated." : "Appointment booked.");
      setAddOpen(false); setEditAppt(null);
      setTimeout(() => setSuccess(""), 4000);
    } else { setFormErr(result.payload || "Failed to save appointment."); }
  };

  const closePanel = () => { setAddOpen(false); setEditAppt(null); };

  const getPatientName = (id) => { const p = patients.find((pt) => String(pt.id) === String(id)); return p ? `${p.firstName} ${p.lastName}` : `Patient #${id}`; };
  const getDoctorName = (id) => { const d = doctors.find((doc) => String(doc.id) === String(id)); return d ? `Dr. ${d.firstName} ${d.lastName}` : "—"; };
  const formatApptDate = (s) => { if (!s) return "—"; try { return format(parseISO(s), "MMM dd, yyyy"); } catch { return s; } };
  const formatApptTime = (s) => { if (!s || !s.includes("T")) return null; try { return format(parseISO(s), "h:mm a"); } catch { return null; } };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Appointments"
        subtitle={`${appointments.length} total appointments`}
        action={<Button onClick={openAdd}><CalendarPlus className="h-4 w-4" /> Book Appointment</Button>}
      />

      {success && <Alert variant="success" onClose={() => setSuccess("")}>{success}</Alert>}
      {error && <Alert variant="error">{typeof error === "string" ? error : "Failed to load appointments."}</Alert>}

      {/* relative wrapper — search + floating panel + table share stacking context */}
      <div className="relative">

        {/* Search / Filter bar */}
        <Card>
          <CardBody className="py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by patient name or notes…"
                  className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <select value={statusFlt} onChange={(e) => setStatusFlt(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </CardBody>
        </Card>

        {/* Click-away dimmer */}
        {addOpen && <div className="absolute inset-0 z-20" style={{ top: "56px" }} onClick={closePanel} />}

        {/* Floating Form Panel */}
        {addOpen && (
          <div id="appt-panel"
            className="absolute left-1/2 -translate-x-1/2 w-full max-w-2xl z-30 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: "64px", animation: "slideDown 0.18s ease-out" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3.5" style={{ backgroundColor: "#3b82f6" }}>
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-white" />
                <h2 className="text-sm font-semibold text-white tracking-wide">
                  {editAppt ? "Edit Appointment" : "Book Appointment"}
                </h2>
              </div>
              <button onClick={closePanel} className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 bg-white">
              <form onSubmit={handleSubmit} className="space-y-3">
                {formErr && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs"><span className="font-semibold">Error:</span> {formErr}</div>}

                {/* Row: Patient + Doctor */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={LBL}>Patient <span className="text-red-500">*</span></label>
                    <select value={form.patientId} onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))} className={F}>
                      <option value="">Select patient…</option>
                      {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={LBL}>Doctor <span className="text-red-500">*</span></label>
                    <select value={form.doctorId} onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))} className={F}>
                      <option value="">Select doctor…</option>
                      {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} — {d.specialization || d.specialty}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row: Type + Status (edit only) */}
                <div className={`grid gap-3 ${editAppt ? "grid-cols-2" : "grid-cols-1"}`}>
                  <div className="space-y-1">
                    <label className={LBL}>Appointment Type <span className="text-red-500">*</span></label>
                    <select value={form.appointmentType} onChange={(e) => setForm((f) => ({ ...f, appointmentType: e.target.value }))} className={F}>
                      {APPOINTMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  {editAppt && (
                    <div className="space-y-1">
                      <label className={LBL}>Status</label>
                      <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={F}>
                        {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* Row: Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={LBL}>Date <span className="text-red-500">*</span></label>
                    <input type="date" value={form.appointmentDate} onChange={(e) => setForm((f) => ({ ...f, appointmentDate: e.target.value }))} className={F} />
                  </div>
                  <div className="space-y-1">
                    <label className={LBL}>Time</label>
                    <input type="time" value={form.appointmentTime} onChange={(e) => setForm((f) => ({ ...f, appointmentTime: e.target.value }))} className={F} />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className={LBL}>Notes</label>
                  <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Additional notes…" className={FTA} />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400"><span className="text-red-500">*</span> Required</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={closePanel} className="h-8 px-4 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="h-8 px-5 rounded-md text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-60 disabled:pointer-events-none"
                      style={{ backgroundColor: "#3b82f6" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}>
                      {saving ? "Saving…" : editAppt ? "Update Appointment" : "Book Appointment"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <Card className="mt-4">
          {loading ? (
            <CardBody><div className="flex justify-center py-16"><Spinner size="lg" /></div></CardBody>
          ) : filtered.length === 0 ? (
            <CardBody><EmptyState icon={CalendarDays} title="No appointments found" description="Book a new appointment to get started." action={<Button onClick={openAdd}><Plus className="h-4 w-4" /> Book Appointment</Button>} /></CardBody>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Patient</Th><Th>Doctor</Th><Th>Date &amp; Time</Th><Th>Type</Th><Th>Status</Th><Th className="w-28">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((a) => (
                  <Tr key={a.id}>
                    <Td><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0"><User className="h-3.5 w-3.5" /></div><span className="font-medium">{getPatientName(a.patientId)}</span></div></Td>
                    <Td className="text-muted-foreground">{getDoctorName(a.doctorId)}</Td>
                    <Td><div><p>{formatApptDate(a.appointmentDate)}</p>{formatApptTime(a.appointmentDate) && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {formatApptTime(a.appointmentDate)}</p>}</div></Td>
                    <Td><Badge variant="muted">{a.appointmentType || "—"}</Badge></Td>
                    <Td><ApptStatusBadge status={a.status || "Scheduled"} /></Td>
                    <Td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(a)} className="px-2 py-1 text-xs rounded-md border border-input hover:bg-muted transition-colors">Edit</button>
                        {a.status !== "Cancelled" && (
                          <button onClick={() => dispatch(cancelAppointment(a.id))} className="px-2 py-1 text-xs rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">Cancel</button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      </div> {/* end relative wrapper */}

      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
};

export default Appointments;
