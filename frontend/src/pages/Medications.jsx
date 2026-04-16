import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMedications, fetchAllPrescriptions, createPrescription } from '../store/slices/medicationsSlice';
import { fetchPatients } from '../store/slices/patientSlice';
import { fetchDoctors } from '../store/slices/doctorSlice';
import { Pill, Plus, Search } from 'lucide-react';
import {
  PageHeader, Button, Card, CardBody, Modal, Input, Select, Textarea,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, EmptyState, Alert,
  Tabs, TabList, Tab, TabPanel, statusVariant,
} from '../components/ui';
import { format } from 'date-fns';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'As needed (PRN)', 'Weekly', 'Monthly'];
const ROUTES      = ['Oral', 'IV', 'IM', 'Subcutaneous', 'Topical', 'Inhaled', 'Sublingual', 'Rectal', 'Nasal'];
const DURATIONS   = ['3 days', '5 days', '7 days', '10 days', '14 days', '30 days', '60 days', '90 days', 'Ongoing'];

// Backend requires: patientId, doctorId, medicationId, prescriptionDate, dosage, frequency, duration
const RX_FORM = {
  patientId: '',
  doctorId: '',
  medicationId: '',
  prescriptionDate: new Date().toISOString().split('T')[0],
  dosage: '',
  frequency: '',
  duration: '',
  route: 'Oral',
  refills: 0,
  notes: '',
};

const Medications = () => {
  const dispatch = useDispatch();
  const { catalog, prescriptions, loading, saving, error } = useSelector((s) => s.medications);
  const { list: patients } = useSelector((s) => s.patients);
  const { list: doctors }  = useSelector((s) => s.doctors);

  const [search,  setSearch]  = useState('');
  const [rxOpen,  setRxOpen]  = useState(false);
  const [rxForm,  setRxForm]  = useState(RX_FORM);
  const [formErr, setFormErr] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchAllMedications());
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
    dispatch(fetchAllPrescriptions());
  }, [dispatch]);

  const getPatientName = (pid) => {
    const p = patients.find((pt) => String(pt.id) === String(pid));
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${pid}`;
  };

  const getDoctorName = (did) => {
    const d = doctors.find((doc) => String(doc.id) === String(did));
    return d ? `Dr. ${d.firstName} ${d.lastName}` : '—';
  };

  // Backend medication model uses "medicationName" as the field name
  const filterCatalog = catalog.filter((m) =>
    !search || (m.medicationName || m.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const filterRx = prescriptions.filter((rx) => {
    const patName = getPatientName(rx.patientId).toLowerCase();
    const medName = (rx.Medication?.medicationName || rx.medicationName || '').toLowerCase();
    return !search || patName.includes(search.toLowerCase()) || medName.includes(search.toLowerCase());
  });

  const handleRxSubmit = async (e) => {
    e.preventDefault();
    setFormErr('');

    if (!rxForm.patientId)       { setFormErr('Patient is required.'); return; }
    if (!rxForm.doctorId)        { setFormErr('Prescribing doctor is required.'); return; }
    if (!rxForm.medicationId)    { setFormErr('Medication from catalog is required.'); return; }
    if (!rxForm.prescriptionDate){ setFormErr('Prescription date is required.'); return; }
    if (!rxForm.dosage)          { setFormErr('Dosage is required.'); return; }
    if (!rxForm.frequency)       { setFormErr('Frequency is required.'); return; }
    if (!rxForm.duration)        { setFormErr('Duration is required.'); return; }

    const result = await dispatch(createPrescription({
      patientId:        rxForm.patientId,
      doctorId:         rxForm.doctorId,
      medicationId:     rxForm.medicationId,
      prescriptionDate: rxForm.prescriptionDate,
      dosage:           rxForm.dosage,
      frequency:        rxForm.frequency,
      duration:         rxForm.duration,
      refills:          Number(rxForm.refills) || 0,
      notes:            rxForm.notes,
    }));

    if (createPrescription.fulfilled.match(result)) {
      setSuccess('Prescription created successfully.');
      setRxOpen(false);
      setRxForm(RX_FORM);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setFormErr(result.payload || 'Failed to create prescription.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Medications"
        subtitle="Prescriptions, drug catalog, and administration records"
        action={
          <Button onClick={() => { setRxForm(RX_FORM); setFormErr(''); setRxOpen(true); }}>
            <Plus className="h-4 w-4" /> New Prescription
          </Button>
        }
      />

      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert variant="error">{typeof error === 'string' ? error : 'Failed to load medications.'}</Alert>}

      <Card><CardBody className="py-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medications, patients…"
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      </CardBody></Card>

      <Tabs defaultTab="prescriptions">
        <TabList>
          <Tab id="prescriptions">Prescriptions ({filterRx.length})</Tab>
          <Tab id="catalog">Drug Catalog ({filterCatalog.length})</Tab>
        </TabList>

        {/* Prescriptions */}
        <TabPanel id="prescriptions">
          <Card>
            {loading ? <CardBody><div className="flex justify-center py-12"><Spinner size="lg" /></div></CardBody>
              : filterRx.length === 0
                ? <CardBody><EmptyState icon={Pill} title="No prescriptions" description="Issue the first prescription." action={<Button onClick={() => setRxOpen(true)}><Plus className="h-4 w-4" />New Prescription</Button>} /></CardBody>
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

        {/* Drug Catalog */}
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

      {/* New Prescription Modal */}
      <Modal open={rxOpen} onClose={() => setRxOpen(false)} title="New Prescription" size="lg">
        <form onSubmit={handleRxSubmit} className="space-y-4">
          {formErr && <Alert variant="error">{formErr}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <Select label="Patient *" required value={rxForm.patientId} onChange={(e) => setRxForm((f) => ({ ...f, patientId: e.target.value }))}>
              <option value="">Select patient…</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </Select>

            <Select label="Prescribing Doctor *" required value={rxForm.doctorId} onChange={(e) => setRxForm((f) => ({ ...f, doctorId: e.target.value }))}>
              <option value="">Select doctor…</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
            </Select>
          </div>

          <Select label="Medication (from catalog) *" required value={rxForm.medicationId}
            onChange={(e) => setRxForm((f) => ({ ...f, medicationId: e.target.value }))}>
            <option value="">Select medication…</option>
            {catalog.map((m) => <option key={m.id} value={m.id}>{m.medicationName || m.name} {m.dosage ? `(${m.dosage})` : ''}</option>)}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Dosage *" required placeholder="e.g. 500mg" value={rxForm.dosage}
              onChange={(e) => setRxForm((f) => ({ ...f, dosage: e.target.value }))} />
            <Select label="Frequency *" required value={rxForm.frequency}
              onChange={(e) => setRxForm((f) => ({ ...f, frequency: e.target.value }))}>
              <option value="">Select frequency…</option>
              {FREQUENCIES.map((freq) => <option key={freq}>{freq}</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select label="Duration *" required value={rxForm.duration}
              onChange={(e) => setRxForm((f) => ({ ...f, duration: e.target.value }))}>
              <option value="">Select duration…</option>
              {DURATIONS.map((d) => <option key={d}>{d}</option>)}
            </Select>
            <Input label="Prescription Date *" required type="date" value={rxForm.prescriptionDate}
              onChange={(e) => setRxForm((f) => ({ ...f, prescriptionDate: e.target.value }))} />
            <Input label="Refills" type="number" min="0" max="10" value={rxForm.refills}
              onChange={(e) => setRxForm((f) => ({ ...f, refills: e.target.value }))} />
          </div>

          <Textarea label="Notes / Instructions" rows={2} placeholder="e.g. Take with food, avoid alcohol"
            value={rxForm.notes} onChange={(e) => setRxForm((f) => ({ ...f, notes: e.target.value }))} />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setRxOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create Prescription'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Medications;
