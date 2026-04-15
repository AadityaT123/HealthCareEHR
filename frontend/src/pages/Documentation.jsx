import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Plus, Stethoscope, ClipboardList, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

import { fetchEncountersByPatient, createEncounter } from '../store/slices/clinicalSlice';
import { fetchProgressNotesByPatient, createProgressNote } from '../store/slices/clinicalSlice';
import { fetchPatients } from '../store/slices/patientSlice';
import {
  Card, CardHeader, CardBody, Button, Badge, Spinner,
  EmptyState, Modal, Input, Select, Textarea, statusVariant
} from '../components/ui';

// ── New Encounter Form ────────────────────────────────────────────────────────
const EncounterForm = ({ patients, onSubmit, onClose }) => {
  const [form, setForm] = useState({ patientId: '', reason: '', notes: '', encounterType: 'Outpatient' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.patientId) e.patientId = 'Patient is required';
    if (!form.reason) e.reason = 'Reason is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Patient *" error={errors.patientId} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
        <option value="">Select a patient...</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
        ))}
      </Select>
      <Select label="Encounter Type" value={form.encounterType} onChange={(e) => setForm({ ...form, encounterType: e.target.value })}>
        <option>Outpatient</option>
        <option>Inpatient</option>
        <option>Emergency</option>
        <option>Telemedicine</option>
      </Select>
      <Input label="Chief Complaint / Reason *" placeholder="e.g. Follow-up visit, chest pain..." error={errors.reason} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
      <Textarea label="Clinical Notes" placeholder="Enter encounter notes, assessment..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Create Encounter</Button>
      </div>
    </form>
  );
};

// ── New Progress Note Form ────────────────────────────────────────────────────
const ProgressNoteForm = ({ patients, onSubmit, onClose }) => {
  const [form, setForm] = useState({ patientId: '', noteType: 'SOAP', content: '', subjective: '', objective: '', assessment: '', plan: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.patientId) e.patientId = 'Patient is required';
    if (!form.content && !form.subjective) e.content = 'Note content is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Patient *" error={errors.patientId} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
        <option value="">Select a patient...</option>
        {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
      </Select>
      <Select label="Note Type" value={form.noteType} onChange={(e) => setForm({ ...form, noteType: e.target.value })}>
        <option value="SOAP">SOAP Note</option>
        <option value="Narrative">Narrative</option>
        <option value="Assessment">Assessment</option>
        <option value="Treatment Plan">Treatment Plan</option>
      </Select>
      {form.noteType === 'SOAP' ? (
        <div className="space-y-3">
          <Input label="Subjective" placeholder="Patient's reported symptoms..." value={form.subjective} onChange={(e) => setForm({ ...form, subjective: e.target.value })} />
          <Input label="Objective" placeholder="Clinical observations, vitals..." value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
          <Textarea label="Assessment" placeholder="Diagnosis and clinical impression..." value={form.assessment} onChange={(e) => setForm({ ...form, assessment: e.target.value })} />
          <Textarea label="Plan" placeholder="Treatment plan, follow-up..." value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} />
        </div>
      ) : (
        <Textarea label="Note Content *" placeholder="Enter clinical note..." rows={6} error={errors.content} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Note</Button>
      </div>
    </form>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Documentation = () => {
  const dispatch = useDispatch();
  const { encounters, progressNotes, loading, error } = useSelector((s) => s.clinical);
  const { list: patients } = useSelector((s) => s.patients);

  const [activeTab, setActiveTab] = useState('encounters');
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Load all patients for the dropdowns
  useEffect(() => {
    dispatch(fetchPatients());
    // Load all encounters (no specific patient filter at page level)
    // We call with a dummy large limit so we see recent ones
  }, [dispatch]);

  const handleCreateEncounter = async (data) => {
    await dispatch(createEncounter(data));
    setShowEncounterModal(false);
    // Refresh the patient's encounters
    if (data.patientId) dispatch(fetchEncountersByPatient(data.patientId));
  };

  const handleCreateNote = async (data) => {
    await dispatch(createProgressNote(data));
    setShowNoteModal(false);
    if (data.patientId) dispatch(fetchProgressNotesByPatient(data.patientId));
  };

  const tabs = [
    { key: 'encounters', label: 'Encounters', icon: Stethoscope },
    { key: 'notes', label: 'Progress Notes', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clinical Documentation</h1>
          <p className="text-muted-foreground mt-1 text-sm">Document encounters, assessments, treatment plans and progress notes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNoteModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Progress Note
          </Button>
          <Button onClick={() => setShowEncounterModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Encounter
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                ${activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Encounters Tab */}
      {activeTab === 'encounters' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" /> Clinical Encounters
              </h2>
              <span className="text-sm text-muted-foreground">{encounters.length} records</span>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : error ? (
              <div className="flex items-center gap-3 p-6 text-destructive">
                <AlertCircle className="h-5 w-5" /> {error}
              </div>
            ) : encounters.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="No encounters documented"
                description="Start by creating a new clinical encounter for a patient."
                action={<Button size="sm" onClick={() => setShowEncounterModal(true)}><Plus className="mr-2 h-4 w-4" />Create Encounter</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Date</th>
                      <th className="px-6 py-3 text-left font-medium">Patient</th>
                      <th className="px-6 py-3 text-left font-medium">Type</th>
                      <th className="px-6 py-3 text-left font-medium">Reason</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {encounters.map((enc) => (
                      <tr key={enc.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3 text-muted-foreground">{enc.createdAt ? format(new Date(enc.createdAt), 'MMM dd, yyyy') : '—'}</td>
                        <td className="px-6 py-3 font-medium text-foreground">{enc.Patient ? `${enc.Patient.firstName} ${enc.Patient.lastName}` : enc.patientId?.substring(0, 8)}</td>
                        <td className="px-6 py-3"><Badge variant="info">{enc.encounterType || 'Outpatient'}</Badge></td>
                        <td className="px-6 py-3 text-foreground">{enc.reason || enc.chiefComplaint || '—'}</td>
                        <td className="px-6 py-3"><Badge variant={statusVariant(enc.status || 'Active')}>{enc.status || 'Active'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Progress Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : progressNotes.length === 0 ? (
            <Card>
              <CardBody>
                <EmptyState
                  icon={ClipboardList}
                  title="No progress notes"
                  description="Document a patient's clinical progress using SOAP or narrative notes."
                  action={<Button size="sm" onClick={() => setShowNoteModal(true)}><Plus className="mr-2 h-4 w-4" />Add Note</Button>}
                />
              </CardBody>
            </Card>
          ) : (
            progressNotes.map((note) => (
              <Card key={note.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="info">{note.noteType || 'Note'}</Badge>
                        <span className="text-xs text-muted-foreground">{note.createdAt ? format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm') : '—'}</span>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                        {note.content || note.subjective || 'No content'}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <Modal open={showEncounterModal} onClose={() => setShowEncounterModal(false)} title="New Clinical Encounter">
        <EncounterForm patients={patients} onSubmit={handleCreateEncounter} onClose={() => setShowEncounterModal(false)} />
      </Modal>
      <Modal open={showNoteModal} onClose={() => setShowNoteModal(false)} title="New Progress Note">
        <ProgressNoteForm patients={patients} onSubmit={handleCreateNote} onClose={() => setShowNoteModal(false)} />
      </Modal>
    </div>
  );
};

export default Documentation;
