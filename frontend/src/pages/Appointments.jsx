import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from "../store/slices/appointmentSlice";
import { fetchPatients } from "../store/slices/patientSlice";
import { fetchDoctors } from "../store/slices/doctorSlice";
import { CalendarDays, Plus, Search, Clock, User } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Modal,
  Input,
  Select,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  EmptyState,
  Alert,
  statusVariant,
} from "../components/ui";
import { format, parseISO } from "date-fns";

// Backend ENUM values — must match exactly
const APPOINTMENT_TYPES = [
  "Consultation",
  "Follow-up",
  "Emergency",
  "Routine Check-up",
];
const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled", "No-Show"];

const EMPTY_FORM = {
  patientId: "",
  doctorId: "",
  appointmentDate: "", // ISO date string, time component appended before dispatch
  appointmentTime: "", // UI-only field merged into appointmentDate
  appointmentType: "Consultation",
  status: "Scheduled",
  notes: "",
};

const Appointments = () => {
  const dispatch = useDispatch();
  const {
    list: appointments,
    loading,
    saving,
    error,
  } = useSelector((s) => s.appointments);
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
    const matchSearch =
      !search ||
      patName.includes(search.toLowerCase()) ||
      (a.notes || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFlt || a.status === statusFlt;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormErr("");
    setEditAppt(null);
    setAddOpen(true);
  };

  const openEdit = (appt) => {
    setEditAppt(appt);
    const dateOnly = appt.appointmentDate
      ? appt.appointmentDate.split("T")[0]
      : "";
    const timeOnly = appt.appointmentDate?.includes("T")
      ? appt.appointmentDate.split("T")[1]?.substring(0, 5)
      : "";
    setForm({
      patientId: String(appt.patientId || ""),
      doctorId: String(appt.doctorId || ""),
      appointmentDate: dateOnly,
      appointmentTime: timeOnly,
      appointmentType: appt.appointmentType || "Consultation",
      status: appt.status || "Scheduled",
      notes: appt.notes || "",
    });
    setFormErr("");
    setAddOpen(true);
  };

  const buildPayload = () => {
    // Merge date and time into a single ISO datetime for backend
    const dateTime = form.appointmentTime
      ? `${form.appointmentDate}T${form.appointmentTime}:00`
      : `${form.appointmentDate}T08:00:00`;
    return {
      patientId: form.patientId,
      doctorId: form.doctorId,
      appointmentDate: dateTime,
      appointmentType: form.appointmentType,
      status: form.status,
      notes: form.notes,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr("");

    if (!form.patientId) {
      setFormErr("Patient is required.");
      return;
    }
    if (!form.doctorId) {
      setFormErr("Prescribing doctor is required.");
      return;
    }
    if (!form.appointmentDate) {
      setFormErr("Appointment date is required.");
      return;
    }
    if (!form.appointmentType) {
      setFormErr("Appointment type is required.");
      return;
    }

    const action = editAppt
      ? updateAppointment({ id: editAppt.id, data: buildPayload() })
      : createAppointment(buildPayload());

    const result = await dispatch(action);
    const fulfilled = editAppt
      ? updateAppointment.fulfilled.match(result)
      : createAppointment.fulfilled.match(result);

    if (fulfilled) {
      setSuccess(editAppt ? "Appointment updated." : "Appointment booked.");
      setAddOpen(false);
      setEditAppt(null);
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setFormErr(result.payload || "Failed to save appointment.");
    }
  };

  const handleCancel = async (id) => {
    await dispatch(cancelAppointment(id));
  };

  const getPatientName = (patientId) => {
    const p = patients.find((pt) => String(pt.id) === String(patientId));
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${patientId}`;
  };

  const getDoctorName = (doctorId) => {
    const d = doctors.find((doc) => String(doc.id) === String(doctorId));
    return d ? `Dr. ${d.firstName} ${d.lastName}` : "—";
  };

  const formatApptDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return format(parseISO(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatApptTime = (dateStr) => {
    if (!dateStr || !dateStr.includes("T")) return null;
    try {
      return format(parseISO(dateStr), "h:mm a");
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Appointments"
        subtitle={`${appointments.length} total appointments`}
        action={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Book Appointment
          </Button>
        }
      />

      {success && (
        <Alert variant="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="error">
          {typeof error === "string" ? error : "Failed to load appointments."}
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardBody className="py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient name or notes…"
                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <select
              value={statusFlt}
              onChange={(e) => setStatusFlt(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <CardBody>
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          </CardBody>
        ) : filtered.length === 0 ? (
          <CardBody>
            <EmptyState
              icon={CalendarDays}
              title="No appointments found"
              description="Book a new appointment to get started."
              action={
                <Button onClick={openAdd}>
                  <Plus className="h-4 w-4" /> Book Appointment
                </Button>
              }
            />
          </CardBody>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Patient</Th>
                <Th>Doctor</Th>
                <Th>Date &amp; Time</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th className="w-28">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((a) => (
                <Tr key={a.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium">
                        {getPatientName(a.patientId)}
                      </span>
                    </div>
                  </Td>
                  <Td className="text-muted-foreground">
                    {getDoctorName(a.doctorId)}
                  </Td>
                  <Td>
                    <div>
                      <p>{formatApptDate(a.appointmentDate)}</p>
                      {formatApptTime(a.appointmentDate) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />{" "}
                          {formatApptTime(a.appointmentDate)}
                        </p>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <Badge variant="muted">{a.appointmentType || "—"}</Badge>
                  </Td>
                  <Td>
                    <Badge variant={statusVariant(a.status)}>
                      {a.status || "Scheduled"}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(a)}
                        className="px-2 py-1 text-xs rounded-md border border-input hover:bg-muted transition-colors"
                      >
                        Edit
                      </button>
                      {a.status !== "Cancelled" && (
                        <button
                          onClick={() => handleCancel(a.id)}
                          className="px-2 py-1 text-xs rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      {/* Book / Edit Modal */}
      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditAppt(null);
        }}
        title={editAppt ? "Edit Appointment" : "Book Appointment"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formErr && <Alert variant="error">{formErr}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Patient *"
              required
              value={form.patientId}
              onChange={(e) =>
                setForm((f) => ({ ...f, patientId: e.target.value }))
              }
            >
              <option value="">Select patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </Select>

            <Select
              label="Doctor *"
              required
              value={form.doctorId}
              onChange={(e) =>
                setForm((f) => ({ ...f, doctorId: e.target.value }))
              }
            >
              <option value="">Select doctor…</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.firstName} {d.lastName} —{" "}
                  {d.specialization || d.specialty}
                </option>
              ))}
            </Select>
          </div>

          <Select
            label="Appointment Type *"
            required
            value={form.appointmentType}
            onChange={(e) =>
              setForm((f) => ({ ...f, appointmentType: e.target.value }))
            }
          >
            {APPOINTMENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date *"
              required
              type="date"
              value={form.appointmentDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, appointmentDate: e.target.value }))
              }
            />
            <Input
              label="Time"
              type="time"
              value={form.appointmentTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, appointmentTime: e.target.value }))
              }
            />
          </div>

          {editAppt && (
            <Select
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          )}

          <Textarea
            label="Notes"
            rows={3}
            placeholder="Additional notes…"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setAddOpen(false);
                setEditAppt(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editAppt ? "Update" : "Book Appointment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
