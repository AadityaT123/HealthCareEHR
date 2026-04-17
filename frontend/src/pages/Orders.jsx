import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createLabOrder, createImagingOrder,
  setAllLabOrders, setAllImagingOrders, setAllLabResults,
} from '../store/slices/ordersSlice';
import { fetchPatients } from '../store/slices/patientSlice';
import { labOrderService, imagingOrderService, labResultService } from '../api/order.service.js';
import { Activity, Plus, Search, FlaskConical, Scan } from 'lucide-react';
import {
  PageHeader, Button, Card, CardBody, Modal, Input, Select, Textarea,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, EmptyState, Alert,
  Tabs, TabList, Tab, TabPanel, statusVariant,
} from '../components/ui';
import { format } from 'date-fns';

const LAB_PANELS = ['Complete Blood Count (CBC)', 'Basic Metabolic Panel (BMP)', 'Comprehensive Metabolic Panel (CMP)', 'Lipid Panel', 'Thyroid Function', 'Liver Function', 'Urinalysis', 'HbA1c', 'PT/INR', 'Blood Culture'];
const IMG_TYPES  = ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'PET Scan', 'Mammography', 'Echocardiogram'];
const PRIORITIES = ['Routine', 'Urgent', 'STAT'];

const LAB_FORM = { patientId: '', panelName: '', priority: 'Routine', clinicalIndication: '', notes: '' };
const IMG_FORM = { patientId: '', imagingType: '', bodyPart: '', priority: 'Routine', clinicalIndication: '', notes: '' };

const toArray = (res) => {
  if (Array.isArray(res))        return res;
  if (Array.isArray(res?.data))  return res.data;
  return [];
};

const Orders = () => {
  const dispatch = useDispatch();
  const { allLabOrders, allImagingOrders, allLabResults, loading, error } = useSelector((s) => s.orders);
  const { list: patients } = useSelector((s) => s.patients);

  const [search,   setSearch]  = useState('');
  const [labOpen,  setLabOpen]  = useState(false);
  const [imgOpen,  setImgOpen]  = useState(false);
  const [labForm,  setLabForm]  = useState(LAB_FORM);
  const [imgForm,  setImgForm]  = useState(IMG_FORM);
  const [formErr,  setFormErr]  = useState('');
  const [success,  setSuccess]  = useState('');

  useEffect(() => {
    dispatch(fetchPatients());
    labOrderService.getAll()
      .then((res) => dispatch(setAllLabOrders(toArray(res))))
      .catch(() => {});
    imagingOrderService.getAll()
      .then((res) => dispatch(setAllImagingOrders(toArray(res))))
      .catch(() => {});
    labResultService.getAll()
      .then((res) => dispatch(setAllLabResults(toArray(res))))
      .catch(() => {});
  }, [dispatch]);

  const getPatientName = (pid) => {
    const p = patients.find((pt) => String(pt.id) === String(pid));
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${pid}`;
  };

  const filterList = (list) => {
    if (!Array.isArray(list)) return [];
    if (!search) return list;
    return list.filter((item) =>
      getPatientName(item.patientId).toLowerCase().includes(search.toLowerCase()) ||
      (item.panelName || item.imagingType || item.testName || '').toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleLabSubmit = async (e) => {
    e.preventDefault(); setFormErr('');
    if (!labForm.patientId || !labForm.panelName) { setFormErr('Patient and test panel are required.'); return; }
    const result = await dispatch(createLabOrder(labForm));
    if (createLabOrder.fulfilled.match(result)) {
      setSuccess('Lab order created.'); setLabOpen(false); setLabForm(LAB_FORM);
      setTimeout(() => setSuccess(''), 4000);
    } else { setFormErr(result.payload || 'Failed.'); }
  };

  const handleImgSubmit = async (e) => {
    e.preventDefault(); setFormErr('');
    if (!imgForm.patientId || !imgForm.imagingType) { setFormErr('Patient and imaging type are required.'); return; }
    const result = await dispatch(createImagingOrder(imgForm));
    if (createImagingOrder.fulfilled.match(result)) {
      setSuccess('Imaging order created.'); setImgOpen(false); setImgForm(IMG_FORM);
      setTimeout(() => setSuccess(''), 4000);
    } else { setFormErr(result.payload || 'Failed.'); }
  };

  const fLab = filterList(allLabOrders);
  const fImg = filterList(allImagingOrders);
  const fRes = filterList(allLabResults);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Orders"
        subtitle="Lab orders, imaging requests, and results"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setImgForm(IMG_FORM); setFormErr(''); setImgOpen(true); }}>
              <Plus className="h-4 w-4" /> Imaging
            </Button>
            <Button onClick={() => { setLabForm(LAB_FORM); setFormErr(''); setLabOpen(true); }}>
              <Plus className="h-4 w-4" /> Lab Order
            </Button>
          </div>
        }
      />

      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert variant="error">{typeof error === 'string' ? error : 'Failed to load orders.'}</Alert>}

      <Card><CardBody className="py-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders…"
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      </CardBody></Card>

      <Tabs defaultTab="lab">
        <TabList>
          <Tab id="lab">Lab Orders ({fLab.length})</Tab>
          <Tab id="imaging">Imaging ({fImg.length})</Tab>
          <Tab id="results">Lab Results ({fRes.length})</Tab>
        </TabList>

        {/* Lab Orders */}
        <TabPanel id="lab">
          <Card>
            {loading ? <CardBody><div className="flex justify-center py-12"><Spinner size="lg" /></div></CardBody>
              : fLab.length === 0
                ? <CardBody><EmptyState icon={FlaskConical} title="No lab orders" description="Order the first lab test." action={<Button onClick={() => setLabOpen(true)}><Plus className="h-4 w-4" />Lab Order</Button>} /></CardBody>
                : <Table>
                    <Thead><Tr><Th>Patient</Th><Th>Panel / Test</Th><Th>Priority</Th><Th>Clinical Indication</Th><Th>Ordered</Th><Th>Status</Th></Tr></Thead>
                    <Tbody>
                      {fLab.map((o) => (
                        <Tr key={o.id}>
                          <Td><span className="font-medium">{getPatientName(o.patientId)}</span></Td>
                          <Td>{o.panelName || o.testName || '—'}</Td>
                          <Td><Badge variant={o.priority === 'STAT' ? 'danger' : o.priority === 'Urgent' ? 'warning' : 'muted'}>{o.priority || 'Routine'}</Badge></Td>
                          <Td className="max-w-[180px] truncate text-muted-foreground">{o.clinicalIndication || '—'}</Td>
                          <Td className="text-xs text-muted-foreground whitespace-nowrap">{o.createdAt ? format(new Date(o.createdAt), 'MMM dd, yyyy') : '—'}</Td>
                          <Td><Badge variant={statusVariant(o.status)}>{o.status || 'Ordered'}</Badge></Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>}
          </Card>
        </TabPanel>

        {/* Imaging */}
        <TabPanel id="imaging">
          <Card>
            {loading ? <CardBody><div className="flex justify-center py-12"><Spinner size="lg" /></div></CardBody>
              : fImg.length === 0
                ? <CardBody><EmptyState icon={Scan} title="No imaging orders" description="Create an imaging request." action={<Button onClick={() => setImgOpen(true)}><Plus className="h-4 w-4" />Imaging</Button>} /></CardBody>
                : <Table>
                    <Thead><Tr><Th>Patient</Th><Th>Type</Th><Th>Body Part</Th><Th>Priority</Th><Th>Ordered</Th><Th>Status</Th></Tr></Thead>
                    <Tbody>
                      {fImg.map((o) => (
                        <Tr key={o.id}>
                          <Td><span className="font-medium">{getPatientName(o.patientId)}</span></Td>
                          <Td>{o.imagingType || '—'}</Td>
                          <Td className="text-muted-foreground">{o.bodyPart || '—'}</Td>
                          <Td><Badge variant={o.priority === 'STAT' ? 'danger' : o.priority === 'Urgent' ? 'warning' : 'muted'}>{o.priority || 'Routine'}</Badge></Td>
                          <Td className="text-xs text-muted-foreground whitespace-nowrap">{o.createdAt ? format(new Date(o.createdAt), 'MMM dd, yyyy') : '—'}</Td>
                          <Td><Badge variant={statusVariant(o.status)}>{o.status || 'Ordered'}</Badge></Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>}
          </Card>
        </TabPanel>

        {/* Results */}
        <TabPanel id="results">
          <Card>
            {loading ? <CardBody><div className="flex justify-center py-12"><Spinner size="lg" /></div></CardBody>
              : fRes.length === 0
                ? <CardBody><EmptyState icon={Activity} title="No lab results" description="Results will appear here once labs are processed." /></CardBody>
                : <Table>
                    <Thead><Tr><Th>Patient</Th><Th>Test</Th><Th>Result</Th><Th>Reference Range</Th><Th>Date</Th><Th>Status</Th></Tr></Thead>
                    <Tbody>
                      {fRes.map((r) => (
                        <Tr key={r.id}>
                          <Td><span className="font-medium">{getPatientName(r.patientId)}</span></Td>
                          <Td>{r.testName || '—'}</Td>
                          <Td className="font-mono text-sm">{r.resultValue} {r.unit}</Td>
                          <Td className="text-xs text-muted-foreground">{r.referenceRange || '—'}</Td>
                          <Td className="text-xs text-muted-foreground whitespace-nowrap">{r.resultDate ? format(new Date(r.resultDate), 'MMM dd, yyyy') : '—'}</Td>
                          <Td><Badge variant={statusVariant(r.status)}>{r.status || 'Resulted'}</Badge></Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>}
          </Card>
        </TabPanel>
      </Tabs>

      {/* Lab Order Modal */}
      <Modal open={labOpen} onClose={() => setLabOpen(false)} title="New Lab Order">
        <form onSubmit={handleLabSubmit} className="space-y-4">
          {formErr && <Alert variant="error">{formErr}</Alert>}
          <Select label="Patient" required value={labForm.patientId} onChange={(e) => setLabForm((f) => ({ ...f, patientId: e.target.value }))}>
            <option value="">Select patient…</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
          </Select>
          <Select label="Test Panel" required value={labForm.panelName} onChange={(e) => setLabForm((f) => ({ ...f, panelName: e.target.value }))}>
            <option value="">Select panel…</option>
            {LAB_PANELS.map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Select label="Priority" value={labForm.priority} onChange={(e) => setLabForm((f) => ({ ...f, priority: e.target.value }))}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </Select>
          <Textarea label="Clinical Indication" rows={2} placeholder="Reason for ordering…" value={labForm.clinicalIndication} onChange={(e) => setLabForm((f) => ({ ...f, clinicalIndication: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setLabOpen(false)}>Cancel</Button>
            <Button type="submit">Place Order</Button>
          </div>
        </form>
      </Modal>

      {/* Imaging Modal */}
      <Modal open={imgOpen} onClose={() => setImgOpen(false)} title="New Imaging Order">
        <form onSubmit={handleImgSubmit} className="space-y-4">
          {formErr && <Alert variant="error">{formErr}</Alert>}
          <Select label="Patient" required value={imgForm.patientId} onChange={(e) => setImgForm((f) => ({ ...f, patientId: e.target.value }))}>
            <option value="">Select patient…</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Imaging Type" required value={imgForm.imagingType} onChange={(e) => setImgForm((f) => ({ ...f, imagingType: e.target.value }))}>
              <option value="">Select type…</option>
              {IMG_TYPES.map((t) => <option key={t}>{t}</option>)}
            </Select>
            <Input label="Body Part" placeholder="e.g. Chest, Abdomen" value={imgForm.bodyPart} onChange={(e) => setImgForm((f) => ({ ...f, bodyPart: e.target.value }))} />
          </div>
          <Select label="Priority" value={imgForm.priority} onChange={(e) => setImgForm((f) => ({ ...f, priority: e.target.value }))}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </Select>
          <Textarea label="Clinical Indication" rows={2} value={imgForm.clinicalIndication} onChange={(e) => setImgForm((f) => ({ ...f, clinicalIndication: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setImgOpen(false)}>Cancel</Button>
            <Button type="submit">Place Order</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;
