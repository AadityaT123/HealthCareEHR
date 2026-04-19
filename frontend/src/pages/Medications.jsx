import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMedications, fetchAllPrescriptions, createPrescription } from '../store/slices/medicationsSlice';
import { fetchPatients } from '../store/slices/patientSlice';
import { fetchDoctors } from '../store/slices/doctorSlice';
import { Pill, Plus, Search, X } from 'lucide-react';
import {
  PageHeader, Button, Card, CardBody,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, EmptyState, Alert,
  Tabs, TabList, Tab, TabPanel, statusVariant,
} from '../components/ui';
import { format } from 'date-fns';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'As needed (PRN)', 'Weekly', 'Monthly'];
const DURATIONS = ['3 days', '5 days', '7 days', '10 days', '14 days', '30 days', '60 days', '90 days', 'Ongoing'];

const RX_FORM = {
  patientId: '', doctorId: '', medicationId: '',
  prescriptionDate: new Date().toISOString().split('T')[0],
  dosage: '', frequency: '', duration: '', refills: 0, notes: '',
};

const F = "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400";
const FTA = "flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none";
const LBL = "text-xs font-semibold text-slate-700";

const Medications = () => {
  const dispatch = useDispatch();
  const { catalog, prescriptions, loading, saving, error } = useSelector((s) => s.medications);
  const { list: patients } = useSelector((s) => s.patients);
  const { list: doctors } = useSelector((s) => s.doctors);

  const [search, setSearch] = useState('');
  const [rxOpen, setRxOpen] = useState(false);
  const [rxForm, setRxForm] = useState(RX_FORM);
  const [formErr, setFormErr] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchAllMedications());
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
    dispatch(fetchAllPrescriptions());
  }, [dispatch]);

  const getPatientName = (pid) => { const p = patients.find((pt) => String(pt.id) === String(pid)); return p ? `${p.firstName} ${p.lastName}` : `Patient #${pid}`; };
  const getDoctorName = (did) => { const d = doctors.find((doc) => String(doc.id) === String(did)); return d ? `Dr. ${d.firstName} ${d.lastName}` : '—'; };

  const filterCatalog = catalog.filter((m) => !search || (m.medicationName || m.name || '').toLowerCase().includes(search.toLowerCase()));
  const filterRx = prescriptions.filter((rx) => {
    const patName = getPatientName(rx.patientId).toLowerCase();
    const medName = (rx.Medication?.medicationName || rx.medicationName || '').toLowerCase();
    return !search || patName.includes(search.toLowerCase()) || medName.includes(search.toLowerCase());
  });

  const handleRxSubmit = async (e) => {
    e.preventDefault(); setFormErr('');
    if (!rxForm.patientId) { setFormErr('Patient is required.'); return; }
    if (!rxForm.doctorId) { setFormErr('Prescribing doctor is required.'); return; }
    if (!rxForm.medicationId) { setFormErr('Medication from catalog is required.'); return; }
    if (!rxForm.prescriptionDate) { setFormErr('Prescription date is required.'); return; }
    if (!rxForm.dosage) { setFormErr('Dosage is required.'); return; }
    if (!rxForm.frequency) { setFormErr('Frequency is required.'); return; }
    if (!rxForm.duration) { setFormErr('Duration is required.'); return; }

    const result = await dispatch(createPrescription({
      patientId: rxForm.patientId, doctorId: rxForm.doctorId, medicationId: rxForm.medicationId,
      prescriptionDate: rxForm.prescriptionDate, dosage: rxForm.dosage,
      frequency: rxForm.frequency, duration: rxForm.duration,
      refills: Number(rxForm.refills) || 0, notes: rxForm.notes,
    }));

    if (createPrescription.fulfilled.match(result)) {
      setSuccess('Prescription created successfully.'); setRxOpen(false); setRxForm(RX_FORM);
      setTimeout(() => setSuccess(''), 4000);
    } else { setFormErr(result.payload || 'Failed to create prescription.'); }
  };

  const openRx = () => { setRxForm(RX_FORM); setFormErr(''); setRxOpen(true); };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Medications"
        subtitle="Prescriptions, drug catalog, and administration records"
        action={<Button onClick={openRx}><Plus className="h-4 w-4" /> New Prescription</Button>}
      />

      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert variant="error">{typeof error === 'string' ? error : 'Failed to load medications.'}</Alert>}

      {/* Relative wrapper */}
      <div className="relative">

        {/* Search bar */}
        <Card>
          <CardBody className="py-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medications, patients…"
                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardBody>
        </Card>

        {/* Click-away dimmer */}
        {rxOpen && <div className="absolute inset-0 z-20" style={{ top: '56px' }} onClick={() => setRxOpen(false)} />}

        {/* New Prescription Floating Panel */}
        {rxOpen && (
          <div id="rx-panel"
            className="absolute left-1/2 -translate-x-1/2 w-full max-w-2xl z-30 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: '64px', animation: 'slideDown 0.18s ease-out' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3.5" style={{ backgroundColor: '#3b82f6' }}>
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-white" />
                <h2 className="text-sm font-semibold text-white tracking-wide">New Prescription</h2>
              </div>
              <button onClick={() => setRxOpen(false)} className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 bg-white">
              <form onSubmit={handleRxSubmit} className="space-y-3">
                {formErr && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs"><span className="font-semibold">Error:</span> {formErr}</div>}

                {/* Patient + Doctor */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={LBL}>Patient <span className="text-red-500">*</span></label>
                    <select value={rxForm.patientId} onChange={(e) => setRxForm((f) => ({ ...f, patientId: e.target.value }))} className={F}>
                      <option value="">Select patient…</option>
                      {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={LBL}>Prescribing Doctor <span className="text-red-500">*</span></label>
                    <select value={rxForm.doctorId} onChange={(e) => setRxForm((f) => ({ ...f, doctorId: e.target.value }))} className={F}>
                      <option value="">Select doctor…</option>
                      {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                    </select>
                  </div>
                </div>

                {/* Medication */}
                <div className="space-y-1">
                  <label className={LBL}>Medication (from catalog) <span className="text-red-500">*</span></label>
                  <select value={rxForm.medicationId} onChange={(e) => setRxForm((f) => ({ ...f, medicationId: e.target.value }))} className={F}>
                    <option value="">Select medication…</option>
                    {catalog.map((m) => <option key={m.id} value={m.id}>{m.medicationName || m.name} {m.dosage ? `(${m.dosage})` : ''}</option>)}
                  </select>
                </div>

                {/* Dosage + Frequency */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={LBL}>Dosage <span className="text-red-500">*</span></label>
                    <input value={rxForm.dosage} onChange={(e) => setRxForm((f) => ({ ...f, dosage: e.target.value }))} placeholder="e.g. 500mg" className={F} />
                  </div>
                  <div className="space-y-1">
                    <label className={LBL}>Frequency <span className="text-red-500">*</span></label>
                    <select value={rxForm.frequency} onChange={(e) => setRxForm((f) => ({ ...f, frequency: e.target.value }))} className={F}>
                      <option value="">Select frequency…</option>
                      {FREQUENCIES.map((freq) => <option key={freq}>{freq}</option>)}
                    </select>
                  </div>
                </div>

                {/* Duration + Date + Refills */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className={LBL}>Duration <span className="text-red-500">*</span></label>
                    <select value={rxForm.duration} onChange={(e) => setRxForm((f) => ({ ...f, duration: e.target.value }))} className={F}>
                      <option value="">Select…</option>
                      {DURATIONS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={LBL}>Prescription Date <span className="text-red-500">*</span></label>
                    <input type="date" value={rxForm.prescriptionDate} onChange={(e) => setRxForm((f) => ({ ...f, prescriptionDate: e.target.value }))} className={F} />
                  </div>
                  <div className="space-y-1">
                    <label className={LBL}>Refills</label>
                    <input type="number" min="0" max="10" value={rxForm.refills} onChange={(e) => setRxForm((f) => ({ ...f, refills: e.target.value }))} className={F} />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className={LBL}>Notes / Instructions</label>
                  <textarea rows={2} value={rxForm.notes} onChange={(e) => setRxForm((f) => ({ ...f, notes: e.target.value }))} placeholder="e.g. Take with food, avoid alcohol" className={FTA} />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400"><span className="text-red-500">*</span> Required</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setRxOpen(false)} className="h-8 px-4 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="h-8 px-5 rounded-md text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-60 disabled:pointer-events-none"
                      style={{ backgroundColor: '#3b82f6' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}>
                      {saving ? 'Saving…' : 'Create Prescription'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabs + Tables */}
        <div className="mt-4">
          <Tabs defaultTab="prescriptions">
            <TabList>
              <Tab id="prescriptions">Prescriptions ({filterRx.length})</Tab>
              <Tab id="catalog">Drug Catalog ({filterCatalog.length})</Tab>
            </TabList>

            <TabPanel id="prescriptions">
              <Card>
                {loading ? <CardBody><div className="flex justify-center py-12"><Spinner size="lg" /></div></CardBody>
                  : filterRx.length === 0
                    ? <CardBody><EmptyState icon={Pill} title="No prescriptions" description="Issue the first prescription." action={<Button onClick={openRx}><Plus className="h-4 w-4" /> New Prescription</Button>} /></CardBody>
                    : <Table>
                      <Thead><Tr><Th>Patient</Th><Th>Medication</Th><Th>Dosage</Th><Th>Frequency</Th><Th>Duration</Th><Th>Prescribed By</Th><Th>Status</Th></Tr></Thead>
                      <Tbody>
                        {filterRx.map((rx) => (
                          <Tr key={rx.id}>
                            <Td><span className="font-medium">{getPatientName(rx.patientId)}</span></Td>
                            <Td>{rx.Medication?.medicationName || rx.medicationName || '—'}</Td>
                            <Td className="font-mono text-sm">{rx.dosage || '—'}</Td>
                            <Td className="text-muted-foreground">{rx.frequency || '—'}</Td>
                            <Td className="text-muted-foreground">{rx.duration || '—'}</Td>
                            <Td className="text-muted-foreground">{getDoctorName(rx.doctorId)}</Td>
                            <Td><Badge variant={statusVariant(rx.status)}>{rx.status || 'Active'}</Badge></Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>}
              </Card>
            </TabPanel>

            <TabPanel id="catalog">
              <Card>
                {loading ? <CardBody><div className="flex justify-center py-12"><Spinner size="lg" /></div></CardBody>
                  : filterCatalog.length === 0
                    ? <CardBody><EmptyState icon={Pill} title="No medications in catalog" description="The drug catalog is empty." /></CardBody>
                    : <Table>
                      <Thead><Tr><Th>Name</Th><Th>Category</Th><Th>Dosage</Th><Th>Instructions</Th></Tr></Thead>
                      <Tbody>
                        {filterCatalog.map((m) => (
                          <Tr key={m.id}>
                            <Td><span className="font-medium">{m.medicationName || m.name}</span></Td>
                            <Td><Badge variant="info">{m.category || '—'}</Badge></Td>
                            <Td className="font-mono text-xs">{m.dosage || '—'}</Td>
                            <Td className="text-muted-foreground text-xs max-w-[260px] truncate">{m.instructions || '—'}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>}
              </Card>
            </TabPanel>
          </Tabs>
        </div>

      </div> {/* end relative wrapper */}

      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
};

export default Medications;
