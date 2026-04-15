import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pill, Plus, AlertCircle, ClipboardList, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

import { fetchAllMedications, fetchPrescriptionsByPatient, createPrescription } from '../store/slices/medicationsSlice';
import { fetchPatients } from '../store/slices/patientSlice';
import {
  Card, CardHeader, CardBody, Button, Badge, Spinner,
  EmptyState, Modal, Input, Select, Textarea, statusVariant
} from '../components/ui';

// ── Prescribe Form ────────────────────────────────────────────────────────────
const PrescribeForm = ({ patients, medications, onSubmit, onClose }) => {
  const [form, setForm] = useState({
    patientId: '', medicationId: '', dosage: '', frequency: '', route: 'Oral',
    startDate: '', endDate: '', instructions: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.patientId) e.patientId = 'Patient is required';
    if (!form.medicationId) e.medicationId = 'Medication is required';
    if (!form.dosage) e.dosage = 'Dosage is required';
    if (!form.frequency) e.frequency = 'Frequency is required';
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
      <div className="grid grid-cols-1 gap-4">
        <Select label="Patient *" error={errors.patientId} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
          <option value="">Select a patient...</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </Select>
        <Select label="Medication *" error={errors.medicationId} value={form.medicationId} onChange={(e) => setForm({ ...form, medicationId: e.target.value })}>
          <option value="">Select a medication...</option>
          {medications.map((m) => <option key={m.id} value={m.id}>{m.name} {m.strength && `(${m.strength})`}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Dosage *" placeholder="e.g. 500mg, 2 tablets..." error={errors.dosage} value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
        <Input label="Frequency *" placeholder="e.g. Once daily, TID..." error={errors.frequency} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Route" value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })}>
          <option>Oral</option>
          <option>IV</option>
          <option>IM</option>
          <option>Subcutaneous</option>
          <option>Topical</option>
          <option>Inhalation</option>
        </Select>
        <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
      </div>
      <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
      <Textarea label="Instructions / Notes" placeholder="Patient instructions, special notes..." value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Prescribe</Button>
      </div>
    </form>
  );
};

// ── Medication Catalog Row ────────────────────────────────────────────────────
const MedRow = ({ med }) => (
  <tr className="hover:bg-muted/30 transition-colors">
    <td className="px-6 py-3 font-medium text-foreground">{med.name}</td>
    <td className="px-6 py-3 text-muted-foreground">{med.genericName || '—'}</td>
    <td className="px-6 py-3"><Badge variant="info">{med.category || '—'}</Badge></td>
    <td className="px-6 py-3 text-muted-foreground">{med.strength || '—'}</td>
    <td className="px-6 py-3"><Badge variant={med.isActive === false ? 'danger' : 'success'}>{med.isActive === false ? 'Inactive' : 'Active'}</Badge></td>
  </tr>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const Medications = () => {
  const dispatch = useDispatch();
  const { catalog, prescriptions, loading, error } = useSelector((s) => s.medications);
  const { list: patients } = useSelector((s) => s.patients);

  const [activeTab, setActiveTab] = useState('catalog');
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchAllMedications());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPatientId) {
      dispatch(fetchPrescriptionsByPatient(selectedPatientId));
    }
  }, [selectedPatientId, dispatch]);

  const handlePrescribe = async (data) => {
    await dispatch(createPrescription(data));
    setShowPrescribeModal(false);
    if (data.patientId) dispatch(fetchPrescriptionsByPatient(data.patientId));
  };

  const tabs = [
    { key: 'catalog', label: 'Medication Catalog', icon: ShoppingBag },
    { key: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Medication Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Prescribe medications, manage the medication list and support electronic prescribing.</p>
        </div>
        <Button onClick={() => setShowPrescribeModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Prescribe Medication
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Medications in Catalog', value: catalog.length, color: 'bg-blue-100 text-blue-600', Icon: Pill },
          { label: 'Active Prescriptions', value: prescriptions.filter(p => p.status === 'Active').length, color: 'bg-green-100 text-green-600', Icon: ClipboardList },
          { label: 'Pending Review', value: prescriptions.filter(p => !p.status || p.status === 'Pending').length, color: 'bg-yellow-100 text-yellow-600', Icon: AlertCircle },
        ].map(({ label, value, color, Icon }) => (
          <Card key={label} className="flex items-center gap-4 p-5">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                ${activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Catalog Tab */}
      {activeTab === 'catalog' && (
        <Card>
          <CardBody className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : catalog.length === 0 ? (
              <EmptyState icon={Pill} title="No medications in catalog" description="The medication catalog is empty. Add medications to get started." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Brand Name</th>
                      <th className="px-6 py-3 text-left font-medium">Generic Name</th>
                      <th className="px-6 py-3 text-left font-medium">Category</th>
                      <th className="px-6 py-3 text-left font-medium">Strength</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {catalog.map((med) => <MedRow key={med.id} med={med} />)}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {/* Patient selector */}
          <Card>
            <CardBody>
              <div className="max-w-sm">
                <Select
                  label="Filter by Patient"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  <option value="">All patients</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </Select>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-0">
              {loading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : prescriptions.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No prescriptions found"
                  description={selectedPatientId ? 'This patient has no prescriptions.' : 'Select a patient to view prescriptions.'}
                  action={<Button size="sm" onClick={() => setShowPrescribeModal(true)}><Plus className="mr-2 h-4 w-4" />Prescribe</Button>} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium">Medication</th>
                        <th className="px-6 py-3 text-left font-medium">Dosage</th>
                        <th className="px-6 py-3 text-left font-medium">Frequency</th>
                        <th className="px-6 py-3 text-left font-medium">Route</th>
                        <th className="px-6 py-3 text-left font-medium">Status</th>
                        <th className="px-6 py-3 text-left font-medium">Start Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {prescriptions.map((rx) => (
                        <tr key={rx.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-3 font-medium text-foreground">{rx.Medication?.name || rx.medicationId}</td>
                          <td className="px-6 py-3 text-muted-foreground">{rx.dosage}</td>
                          <td className="px-6 py-3 text-muted-foreground">{rx.frequency}</td>
                          <td className="px-6 py-3"><Badge variant="muted">{rx.route || 'Oral'}</Badge></td>
                          <td className="px-6 py-3"><Badge variant={statusVariant(rx.status)}>{rx.status || 'Active'}</Badge></td>
                          <td className="px-6 py-3 text-muted-foreground">{rx.startDate ? format(new Date(rx.startDate), 'MMM dd, yyyy') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Modal */}
      <Modal open={showPrescribeModal} onClose={() => setShowPrescribeModal(false)} title="New Prescription">
        <PrescribeForm patients={patients} medications={catalog} onSubmit={handlePrescribe} onClose={() => setShowPrescribeModal(false)} />
      </Modal>
    </div>
  );
};

export default Medications;
