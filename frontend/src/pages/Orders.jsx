import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, FlaskConical, Scan, Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

import { fetchLabOrdersByPatient, createLabOrder, fetchImagingOrdersByPatient, createImagingOrder } from '../store/slices/ordersSlice';
import { fetchPatients } from '../store/slices/patientSlice';
import {
  Card, CardHeader, CardBody, Button, Badge, Spinner,
  EmptyState, Modal, Input, Select, Textarea, statusVariant
} from '../components/ui';

// ── Lab Order Form ────────────────────────────────────────────────────────────
const LabOrderForm = ({ patients, onSubmit, onClose }) => {
  const [form, setForm] = useState({ patientId: '', testName: '', priority: 'Routine', clinicalNotes: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.patientId) e.patientId = 'Patient is required';
    if (!form.testName) e.testName = 'Test name is required';
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
      <Input label="Test Name *" placeholder="e.g. Complete Blood Count (CBC), HbA1c..." error={errors.testName} value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} />
      <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
        <option>Routine</option>
        <option>Urgent</option>
        <option>STAT</option>
      </Select>
      <Textarea label="Clinical Notes" placeholder="Clinical indication or additional instructions..." value={form.clinicalNotes} onChange={(e) => setForm({ ...form, clinicalNotes: e.target.value })} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Place Order</Button>
      </div>
    </form>
  );
};

// ── Imaging Order Form ────────────────────────────────────────────────────────
const ImagingOrderForm = ({ patients, onSubmit, onClose }) => {
  const [form, setForm] = useState({ patientId: '', imagingType: 'X-Ray', bodyPart: '', priority: 'Routine', clinicalIndication: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.patientId) e.patientId = 'Patient is required';
    if (!form.bodyPart) e.bodyPart = 'Body part is required';
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
      <Select label="Imaging Type" value={form.imagingType} onChange={(e) => setForm({ ...form, imagingType: e.target.value })}>
        <option>X-Ray</option>
        <option>CT Scan</option>
        <option>MRI</option>
        <option>Ultrasound</option>
        <option>PET Scan</option>
        <option>Mammography</option>
      </Select>
      <Input label="Body Part / Region *" placeholder="e.g. Chest, Left knee..." error={errors.bodyPart} value={form.bodyPart} onChange={(e) => setForm({ ...form, bodyPart: e.target.value })} />
      <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
        <option>Routine</option>
        <option>Urgent</option>
        <option>STAT</option>
      </Select>
      <Textarea label="Clinical Indication" placeholder="Reason for imaging study..." value={form.clinicalIndication} onChange={(e) => setForm({ ...form, clinicalIndication: e.target.value })} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Place Imaging Order</Button>
      </div>
    </form>
  );
};

// ── Orders stats card ─────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <Card className="flex items-center gap-4 p-5">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  </Card>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const Orders = () => {
  const dispatch = useDispatch();
  const { labOrders, imagingOrders, loading, error } = useSelector((s) => s.orders);
  const { list: patients } = useSelector((s) => s.patients);

  const [activeTab, setActiveTab] = useState('lab');
  const [showLabModal, setShowLabModal] = useState(false);
  const [showImagingModal, setShowImagingModal] = useState(false);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleCreateLabOrder = async (data) => {
    await dispatch(createLabOrder(data));
    setShowLabModal(false);
    dispatch(fetchLabOrdersByPatient(data.patientId));
  };

  const handleCreateImagingOrder = async (data) => {
    await dispatch(createImagingOrder(data));
    setShowImagingModal(false);
    dispatch(fetchImagingOrdersByPatient(data.patientId));
  };

  const tabs = [
    { key: 'lab', label: 'Lab Orders', icon: FlaskConical },
    { key: 'imaging', label: 'Imaging Orders', icon: Scan },
  ];

  const priorityVariant = (p = '') => {
    if (p === 'STAT') return 'danger';
    if (p === 'Urgent') return 'warning';
    return 'muted';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Order Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Order and review lab tests, imaging studies and diagnostic procedures.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImagingModal(true)}>
            <Scan className="mr-2 h-4 w-4" /> Imaging Order
          </Button>
          <Button onClick={() => setShowLabModal(true)}>
            <FlaskConical className="mr-2 h-4 w-4" /> Lab Order
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Lab Orders" value={labOrders.length} icon={FlaskConical} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard label="Imaging Orders" value={imagingOrders.length} icon={Scan} color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
        <StatCard label="Pending" value={[...labOrders, ...imagingOrders].filter(o => (o.status || '').toLowerCase() === 'pending').length} icon={Activity} color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" />
        <StatCard label="STAT" value={[...labOrders, ...imagingOrders].filter(o => (o.priority || '').toUpperCase() === 'STAT').length} icon={AlertCircle} color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" />
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

      {/* Lab Orders */}
      {activeTab === 'lab' && (
        <Card>
          <CardBody className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : labOrders.length === 0 ? (
              <EmptyState icon={FlaskConical} title="No lab orders" description="Place a lab order to get started."
                action={<Button size="sm" onClick={() => setShowLabModal(true)}><Plus className="mr-2 h-4 w-4" />New Lab Order</Button>} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Test</th>
                      <th className="px-6 py-3 text-left font-medium">Patient</th>
                      <th className="px-6 py-3 text-left font-medium">Priority</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                      <th className="px-6 py-3 text-left font-medium">Ordered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {labOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3 font-medium text-foreground">{o.testName}</td>
                        <td className="px-6 py-3 text-muted-foreground">{o.Patient ? `${o.Patient.firstName} ${o.Patient.lastName}` : '—'}</td>
                        <td className="px-6 py-3"><Badge variant={priorityVariant(o.priority)}>{o.priority || 'Routine'}</Badge></td>
                        <td className="px-6 py-3"><Badge variant={statusVariant(o.status)}>{o.status || 'Pending'}</Badge></td>
                        <td className="px-6 py-3 text-muted-foreground">{o.createdAt ? format(new Date(o.createdAt), 'MMM dd, yyyy') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Imaging Orders */}
      {activeTab === 'imaging' && (
        <Card>
          <CardBody className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : imagingOrders.length === 0 ? (
              <EmptyState icon={Scan} title="No imaging orders" description="Place an imaging study to get started."
                action={<Button size="sm" onClick={() => setShowImagingModal(true)}><Plus className="mr-2 h-4 w-4" />New Imaging Order</Button>} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Type</th>
                      <th className="px-6 py-3 text-left font-medium">Body Part</th>
                      <th className="px-6 py-3 text-left font-medium">Patient</th>
                      <th className="px-6 py-3 text-left font-medium">Priority</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {imagingOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3 font-medium text-foreground">{o.imagingType}</td>
                        <td className="px-6 py-3 text-muted-foreground">{o.bodyPart || '—'}</td>
                        <td className="px-6 py-3 text-muted-foreground">{o.Patient ? `${o.Patient.firstName} ${o.Patient.lastName}` : '—'}</td>
                        <td className="px-6 py-3"><Badge variant={priorityVariant(o.priority)}>{o.priority || 'Routine'}</Badge></td>
                        <td className="px-6 py-3"><Badge variant={statusVariant(o.status)}>{o.status || 'Pending'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modals */}
      <Modal open={showLabModal} onClose={() => setShowLabModal(false)} title="New Lab Order">
        <LabOrderForm patients={patients} onSubmit={handleCreateLabOrder} onClose={() => setShowLabModal(false)} />
      </Modal>
      <Modal open={showImagingModal} onClose={() => setShowImagingModal(false)} title="New Imaging Order">
        <ImagingOrderForm patients={patients} onSubmit={handleCreateImagingOrder} onClose={() => setShowImagingModal(false)} />
      </Modal>
    </div>
  );
};

export default Orders;
