import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createEncounter, createProgressNote,
  setAllEncounters, setAllProgressNotes,
} from '../store/slices/clinicalSlice';
import { fetchPatients } from '../store/slices/patientSlice';
import { encounterService, progressNoteService } from '../api/clinical.service.js';
import { FileText, Plus, Search } from 'lucide-react';
import {
  PageHeader, Button, Card, CardBody, Modal, Input, Select, Textarea,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, EmptyState, Alert,
  Tabs, TabList, Tab, TabPanel, statusVariant,
} from '../components/ui';
import { format } from 'date-fns';

const ENCOUNTER_TYPES = ['Outpatient', 'Inpatient', 'Emergency', 'Telehealth', 'Follow-up'];
const NOTE_TYPES = ['SOAP', 'Progress', 'Discharge', 'Consultation', 'Procedure'];

const ENC_FORM  = { patientId: '', encounterType: '', chiefComplaint: '', diagnosis: '', plan: '', notes: '' };
const NOTE_FORM = { patientId: '', encounterId: '', noteType: 'SOAP', subjective: '', objective: '', assessment: '', plan: '' };

// axiosClient unwraps response.data, so getAll() returns { success, data } directly.
const toArray = (res) => {
  if (Array.isArray(res))       return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const Documentation = () => {
  const dispatch = useDispatch();
  const { allEncounters, allProgressNotes, loading, error } = useSelector((s) => s.clinical);
  const { list: patients } = useSelector((s) => s.patients);

  const [search,       setSearch]      = useState('');
  const [encOpen,      setEncOpen]     = useState(false);
  const [noteOpen,     setNoteOpen]    = useState(false);
  const [encForm,      setEncForm]     = useState(ENC_FORM);
  const [noteForm,     setNoteForm]    = useState(NOTE_FORM);
  const [formErr,      setFormErr]     = useState('');
  const [success,      setSuccess]     = useState('');

  useEffect(() => {
    dispatch(fetchPatients());
    encounterService.getAll()
      .then((res) => dispatch(setAllEncounters(toArray(res))))
      .catch(() => {});
    progressNoteService.getAll()
      .then((res) => dispatch(setAllProgressNotes(toArray(res))))
      .catch(() => {});
  }, [dispatch]);

  const getPatientName = (patientId) => {
    const p = patients.find((pt) => pt.id === patientId || String(pt.id) === String(patientId));
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${patientId}`;
  };


  const filterList = (list) => {
    if (!Array.isArray(list)) return [];
    if (!search) return list;
    return list.filter((item) => {
      const name = getPatientName(item.patientId).toLowerCase();
      return name.includes(search.toLowerCase()) ||
        (item.chiefComplaint || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.noteType || '').toLowerCase().includes(search.toLowerCase());
    });
  };

  const handleEncSubmit = async (e) => {
    e.preventDefault();
    setFormErr('');
    if (!encForm.patientId || !encForm.encounterType) {
      setFormErr('Patient and encounter type are required.');
      return;
    }
    const result = await dispatch(createEncounter(encForm));
    if (createEncounter.fulfilled.match(result)) {
      setSuccess('Encounter created.'); setEncOpen(false); setEncForm(ENC_FORM);
      setTimeout(() => setSuccess(''), 4000);
    } else { setFormErr(result.payload || 'Failed to create encounter.'); }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setFormErr('');
    if (!noteForm.patientId) { setFormErr('Patient is required.'); return; }
    const result = await dispatch(createProgressNote(noteForm));
    if (createProgressNote.fulfilled.match(result)) {
      setSuccess('Progress note created.'); setNoteOpen(false); setNoteForm(NOTE_FORM);
      setTimeout(() => setSuccess(''), 4000);
    } else { setFormErr(result.payload || 'Failed to create note.'); }
  };

  const filteredEnc  = filterList(allEncounters);
  const filteredNote = filterList(allProgressNotes);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Documentation"
        subtitle="Clinical encounters and progress notes"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setNoteForm(NOTE_FORM); setFormErr(''); setNoteOpen(true); }}>
              <Plus className="h-4 w-4" /> Progress Note
            </Button>
            <Button onClick={() => { setEncForm(ENC_FORM); setFormErr(''); setEncOpen(true); }}>
              <Plus className="h-4 w-4" /> New Encounter
            </Button>
          </div>
        }
      />

      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert variant="error">{typeof error === 'string' ? error : 'Failed to load records.'}</Alert>}

      {/* Search */}
      <Card>
        <CardBody className="py-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient, complaint…"
              className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
        </CardBody>
      </Card>

      <Tabs defaultTab="encounters">
        <TabList>
          <Tab id="encounters">Encounters ({filteredEnc.length})</Tab>
          <Tab id="notes">Progress Notes ({filteredNote.length})</Tab>
        </TabList>

        {/* Encounters */}
        <TabPanel id="encounters">
          <Card>
            {loading ? (
              <CardBody><div className="flex justify-center py-16"><Spinner size="lg" /></div></CardBody>
            ) : filteredEnc.length === 0 ? (
              <CardBody>
                <EmptyState icon={FileText} title="No encounters found"
                  description="Create the first clinical encounter."
                  action={<Button onClick={() => setEncOpen(true)}><Plus className="h-4 w-4" />New Encounter</Button>}
                />
              </CardBody>
            ) : (
              <Table>
                <Thead>
                  <Tr><Th>Patient</Th><Th>Type</Th><Th>Chief Complaint</Th><Th>Diagnosis</Th><Th>Date</Th><Th>Status</Th></Tr>
                </Thead>
                <Tbody>
                  {filteredEnc.map((enc) => (
                    <Tr key={enc.id}>
                      <Td><span className="font-medium">{getPatientName(enc.patientId)}</span></Td>
                      <Td><Badge variant="info">{enc.encounterType || enc.type}</Badge></Td>
                      <Td className="max-w-[200px] truncate text-muted-foreground">{enc.chiefComplaint || '—'}</Td>
                      <Td className="max-w-[180px] truncate text-muted-foreground">{enc.diagnosis || '—'}</Td>
                      <Td className="text-xs text-muted-foreground whitespace-nowrap">
                        {enc.createdAt ? format(new Date(enc.createdAt), 'MMM dd, yyyy') : '—'}
                      </Td>
                      <Td><Badge variant={statusVariant(enc.status)}>{enc.status || 'Completed'}</Badge></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Card>
        </TabPanel>

        {/* Progress Notes */}
        <TabPanel id="notes">
          <Card>
            {loading ? (
              <CardBody><div className="flex justify-center py-16"><Spinner size="lg" /></div></CardBody>
            ) : filteredNote.length === 0 ? (
              <CardBody>
                <EmptyState icon={FileText} title="No progress notes"
                  description="Create the first progress note."
                  action={<Button onClick={() => setNoteOpen(true)}><Plus className="h-4 w-4" />New Note</Button>}
                />
              </CardBody>
            ) : (
              <Table>
                <Thead>
                  <Tr><Th>Patient</Th><Th>Type</Th><Th>Subjective</Th><Th>Assessment</Th><Th>Date</Th></Tr>
                </Thead>
                <Tbody>
                  {filteredNote.map((note) => (
                    <Tr key={note.id}>
                      <Td><span className="font-medium">{getPatientName(note.patientId)}</span></Td>
                      <Td><Badge variant="purple">{note.noteType || 'SOAP'}</Badge></Td>
                      <Td className="max-w-[200px] truncate text-muted-foreground">{note.subjective || '—'}</Td>
                      <Td className="max-w-[180px] truncate text-muted-foreground">{note.assessment || '—'}</Td>
                      <Td className="text-xs text-muted-foreground whitespace-nowrap">
                        {note.createdAt ? format(new Date(note.createdAt), 'MMM dd, yyyy') : '—'}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Card>
        </TabPanel>
      </Tabs>

      {/* New Encounter Modal */}
      <Modal open={encOpen} onClose={() => setEncOpen(false)} title="New Encounter" size="md">
        <form onSubmit={handleEncSubmit} className="space-y-4">
          {formErr && <Alert variant="error">{formErr}</Alert>}
          <Select label="Patient" required value={encForm.patientId}
            onChange={(e) => setEncForm((f) => ({ ...f, patientId: e.target.value }))}>
            <option value="">Select patient…</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
          </Select>
          <Select label="Encounter Type" required value={encForm.encounterType}
            onChange={(e) => setEncForm((f) => ({ ...f, encounterType: e.target.value }))}>
            <option value="">Select type…</option>
            {ENCOUNTER_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Input label="Chief Complaint" placeholder="Why is the patient here?"
            value={encForm.chiefComplaint} onChange={(e) => setEncForm((f) => ({ ...f, chiefComplaint: e.target.value }))} />
          <Textarea label="Diagnosis" rows={2} placeholder="Diagnosis or differential…"
            value={encForm.diagnosis} onChange={(e) => setEncForm((f) => ({ ...f, diagnosis: e.target.value }))} />
          <Textarea label="Plan" rows={2} placeholder="Treatment plan…"
            value={encForm.plan} onChange={(e) => setEncForm((f) => ({ ...f, plan: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setEncOpen(false)}>Cancel</Button>
            <Button type="submit">Create Encounter</Button>
          </div>
        </form>
      </Modal>

      {/* New Progress Note Modal */}
      <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title="New Progress Note" size="lg">
        <form onSubmit={handleNoteSubmit} className="space-y-4">
          {formErr && <Alert variant="error">{formErr}</Alert>}
          <div className="grid grid-cols-2 gap-4">
            <Select label="Patient" required value={noteForm.patientId}
              onChange={(e) => setNoteForm((f) => ({ ...f, patientId: e.target.value }))}>
              <option value="">Select patient…</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </Select>
            <Select label="Note Type" value={noteForm.noteType}
              onChange={(e) => setNoteForm((f) => ({ ...f, noteType: e.target.value }))}>
              {NOTE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </div>
          <Textarea label="Subjective" rows={2} placeholder="Patient's reported symptoms…"
            value={noteForm.subjective} onChange={(e) => setNoteForm((f) => ({ ...f, subjective: e.target.value }))} />
          <Textarea label="Objective" rows={2} placeholder="Examination findings, vitals…"
            value={noteForm.objective} onChange={(e) => setNoteForm((f) => ({ ...f, objective: e.target.value }))} />
          <Textarea label="Assessment" rows={2} placeholder="Clinical assessment…"
            value={noteForm.assessment} onChange={(e) => setNoteForm((f) => ({ ...f, assessment: e.target.value }))} />
          <Textarea label="Plan" rows={2} placeholder="Treatment plan…"
            value={noteForm.plan} onChange={(e) => setNoteForm((f) => ({ ...f, plan: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button type="submit">Save Note</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Documentation;
