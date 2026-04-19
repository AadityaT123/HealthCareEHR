import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createLabOrder, createImagingOrder,
  setAllLabOrders, setAllImagingOrders, setAllLabResults,
} from '../store/slices/ordersSlice';
import { fetchPatients } from '../store/slices/patientSlice';
import { fetchDoctors } from '../store/slices/doctorSlice';
import { labOrderService, imagingOrderService, labResultService } from '../api/order.service.js';
import { Activity, Plus, Search, FlaskConical, Scan, X } from 'lucide-react';
import {
  PageHeader, Button, Card, CardBody,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, EmptyState, Alert,
  Tabs, TabList, Tab, TabPanel, statusVariant,
} from '../components/ui';
import { format } from 'date-fns';

const LAB_PANELS = ['Complete Blood Count (CBC)', 'Basic Metabolic Panel (BMP)', 'Comprehensive Metabolic Panel (CMP)', 'Lipid Panel', 'Thyroid Function', 'Liver Function', 'Urinalysis', 'HbA1c', 'PT/INR', 'Blood Culture'];
const IMG_TYPES = ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'PET Scan', 'Mammography', 'Echocardiogram'];
const PRIORITIES = ['Routine', 'Urgent', 'STAT'];

const LAB_FORM = { patientId: '', doctorId: '', panelName: '', priority: 'Routine', clinicalIndication: '', notes: '' };
const IMG_FORM = { patientId: '', doctorId: '', imagingType: '', bodyPart: '', priority: 'Routine', clinicalIndication: '', notes: '' };

const toArray = (res) => { if (Array.isArray(res)) return res; if (Array.isArray(res?.data)) return res.data; return []; };

const F = "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400";
const FTA = "flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none";
const LBL = "text-xs font-semibold text-slate-700";

const Orders = () => {
  const dispatch = useDispatch();
  const { allLabOrders, allImagingOrders, allLabResults, loading, error } = useSelector((s) => s.orders);
  const { list: patients } = useSelector((s) => s.patients);
  const { list: doctors }  = useSelector((s) => s.doctors);

  const [search, setSearch] = useState('');
  const [labOpen, setLabOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  const [labForm, setLabForm] = useState(LAB_FORM);
  const [imgForm, setImgForm] = useState(IMG_FORM);
  const [formErr, setFormErr] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
    labOrderService.getAll().then((res) => dispatch(setAllLabOrders(toArray(res)))).catch(() => { });
    imagingOrderService.getAll().then((res) => dispatch(setAllImagingOrders(toArray(res)))).catch(() => { });
    labResultService.getAll().then((res) => dispatch(setAllLabResults(toArray(res)))).catch(() => { });
  }, [dispatch]);

  const getPatientName = (pid) => { const p = patients.find((pt) => String(pt.id) === String(pid)); return p ? `${p.firstName} ${p.lastName}` : `Patient #${pid}`; };
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
    if (!labForm.patientId) { setFormErr('Patient is required.'); return; }
    if (!labForm.doctorId)  { setFormErr('Doctor is required.'); return; }
    if (!labForm.panelName) { setFormErr('Test panel is required.'); return; }
    const payload = {
      patientId:          Number(labForm.patientId),
      doctorId:           Number(labForm.doctorId),
      panelName:          labForm.panelName,
      testType:           labForm.panelName,   // backend alias
      orderDate:          new Date().toISOString(),
      priority:           labForm.priority || 'Routine',
      clinicalIndication: labForm.clinicalIndication || '',
    };
    const result = await dispatch(createLabOrder(payload));
    if (createLabOrder.fulfilled.match(result)) {
      setSuccess('Lab order created.'); setLabOpen(false); setLabForm(LAB_FORM);
      setTimeout(() => setSuccess(''), 4000);
    } else { setFormErr(result.payload || 'Failed.'); }
  };

  const handleImgSubmit = async (e) => {
    e.preventDefault(); setFormErr('');
    if (!imgForm.patientId)    { setFormErr('Patient is required.'); return; }
    if (!imgForm.doctorId)     { setFormErr('Doctor is required.'); return; }
    if (!imgForm.imagingType)  { setFormErr('Imaging type is required.'); return; }
    const payload = {
      patientId:          Number(imgForm.patientId),
      doctorId:           Number(imgForm.doctorId),
      imagingType:        imgForm.imagingType,
      bodyPart:           imgForm.bodyPart || 'Not specified',
      priority:           imgForm.priority || 'Routine',
      clinicalIndication: imgForm.clinicalIndication || '',
      clinicalReason:     imgForm.clinicalIndication || '',  // backend alias
    };
    const result = await dispatch(createImagingOrder(payload));
    if (createImagingOrder.fulfilled.match(result)) {
      setSuccess('Imaging order created.'); setImgOpen(false); setImgForm(IMG_FORM);
      setTimeout(() => setSuccess(''), 4000);
    } else { setFormErr(result.payload || 'Failed.'); }
  };

  const openLab = () => { setLabForm(LAB_FORM); setFormErr(''); setImgOpen(false); setLabOpen(true); };
  const openImg = () => { setImgForm(IMG_FORM); setFormErr(''); setLabOpen(false); setImgOpen(true); };

  const fLab = filterList(allLabOrders);
  const fImg = filterList(allImagingOrders);
  const fRes = filterList(allLabResults);

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Orders"
        subtitle="Lab orders, imaging requests, and results"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={openImg}><Plus className="h-4 w-4" /> Imaging</Button>
            <Button onClick={openLab}><Plus className="h-4 w-4" /> Lab Order</Button>
          </div>
        }
      />

      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert variant="error">{typeof error === 'string' ? error : 'Failed to load orders.'}</Alert>}

      {/* Relative wrapper */}
      <div className="relative">

        {/* Search bar */}
        <Card>
          <CardBody className="py-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders…"
                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardBody>
        </Card>

        {/* Click-away dimmer */}
        {(labOpen || imgOpen) && (
          <div className="absolute inset-0 z-20" style={{ top: '56px' }} onClick={() => { setLabOpen(false); setImgOpen(false); }} />
        )}

        {/* Lab Order Panel */}
        {labOpen && (
          <div id="lab-panel"
            className="absolute left-1/2 -translate-x-1/2 w-full max-w-2xl z-30 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: '64px', animation: 'slideDown 0.18s ease-out' }}>
            <div className="flex items-center justify-between px-6 py-3.5" style={{ backgroundColor: '#3b82f6' }}>
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-white" />
                <h2 className="text-sm font-semibold text-white tracking-wide">New Lab Order</h2>
              </div>
              <button onClick={() => setLabOpen(false)} className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-6 py-4 bg-white">
              <form onSubmit={handleLabSubmit} className="space-y-3">
                {formErr && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs"><span className="font-semibold">Error:</span> {formErr}</div>}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={LBL}>Patient <span className="text-red-500">*</span></label>
                    <select value={labForm.patientId} onChange={(e) => setLabForm((f) => ({ ...f, patientId: e.target.value }))} className={F}>
                      <option value="">Select patient…</option>
                      {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={LBL}>Doctor <span className="text-red-500">*</span></label>
                    <select value={labForm.doctorId} onChange={(e) => setLabForm((f) => ({ ...f, doctorId: e.target.value }))} className={F}>
                      <option value="">Select doctor…</option>
                      {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={LBL}>Test Panel <span className="text-red-500">*</span></label>
                    <select value={labForm.panelName} onChange={(e) => setLabForm((f) => ({ ...f, panelName: e.target.value }))} className={F}>
                      <option value="">Select panel…</option>
                      {LAB_PANELS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={LBL}>Priority</label>
                    <select value={labForm.priority} onChange={(e) => setLabForm((f) => ({ ...f, priority: e.target.value }))} className={F}>
                      {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={LBL}>Clinical Indication</label>
                  <textarea rows={2} value={labForm.clinicalIndication} onChange={(e) => setLabForm((f) => ({ ...f, clinicalIndication: e.target.value }))} placeholder="Reason for ordering…" className={FTA} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400"><span className="text-red-500">*</span> Required</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setLabOpen(false)} className="h-8 px-4 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit"
                      className="h-8 px-5 rounded-md text-xs font-semibold text-white shadow-sm transition-colors"
                      style={{ backgroundColor: '#3b82f6' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}>
                      Place Lab Order
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Imaging Order Panel */}
        {imgOpen && (
          <div id="img-panel"
            className="absolute left-1/2 -translate-x-1/2 w-full max-w-2xl z-30 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: '64px', animation: 'slideDown 0.18s ease-out' }}>
            <div className="flex items-center justify-between px-6 py-3.5" style={{ backgroundColor: '#3b82f6' }}>
              <div className="flex items-center gap-2">
                <Scan className="h-4 w-4 text-white" />
                <h2 className="text-sm font-semibold text-white tracking-wide">New Imaging Order</h2>
              </div>
              <button onClick={() => setImgOpen(false)} className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-6 py-4 bg-white">
              <form onSubmit={handleImgSubmit} className="space-y-3">
                {formErr && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs"><span className="font-semibold">Error:</span> {formErr}</div>}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={LBL}>Patient <span className="text-red-500">*</span></label>
                    <select value={imgForm.patientId} onChange={(e) => setImgForm((f) => ({ ...f, patientId: e.target.value }))} className={F}>
                      <option value="">Select patient…</option>
                      {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={LBL}>Doctor <span className="text-red-500">*</span></label>
                    <select value={imgForm.doctorId} onChange={(e) => setImgForm((f) => ({ ...f, doctorId: e.target.value }))} className={F}>
                      <option value="">Select doctor…</option>
                      {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={LBL}>Imaging Type <span className="text-red-500">*</span></label>
                    <select value={imgForm.imagingType} onChange={(e) => setImgForm((f) => ({ ...f, imagingType: e.target.value }))} className={F}>
                      <option value="">Select type…</option>
                      {IMG_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={LBL}>Body Part</label>
                    <input value={imgForm.bodyPart} onChange={(e) => setImgForm((f) => ({ ...f, bodyPart: e.target.value }))} placeholder="e.g. Chest, Abdomen" className={F} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={LBL}>Priority</label>
                  <select value={imgForm.priority} onChange={(e) => setImgForm((f) => ({ ...f, priority: e.target.value }))} className={F}>
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={LBL}>Clinical Indication</label>
                  <textarea rows={2} value={imgForm.clinicalIndication} onChange={(e) => setImgForm((f) => ({ ...f, clinicalIndication: e.target.value }))} className={FTA} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400"><span className="text-red-500">*</span> Required</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setImgOpen(false)} className="h-8 px-4 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit"
                      className="h-8 px-5 rounded-md text-xs font-semibold text-white shadow-sm transition-colors"
                      style={{ backgroundColor: '#3b82f6' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}>
                      Place Imaging Order
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabs + Tables */}
        <div className="mt-4">
          <Tabs defaultTab="lab">
            <TabList>
              <Tab id="lab">Lab Orders ({fLab.length})</Tab>
              <Tab id="imaging">Imaging ({fImg.length})</Tab>
              <Tab id="results">Lab Results ({fRes.length})</Tab>
            </TabList>

            <TabPanel id="lab">
              <Card>
                {loading ? <CardBody><div className="flex justify-center py-12"><Spinner size="lg" /></div></CardBody>
                  : fLab.length === 0
                    ? <CardBody><EmptyState icon={FlaskConical} title="No lab orders" description="Order the first lab test." action={<Button onClick={openLab}><Plus className="h-4 w-4" /> Lab Order</Button>} /></CardBody>
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

            <TabPanel id="imaging">
              <Card>
                {loading ? <CardBody><div className="flex justify-center py-12"><Spinner size="lg" /></div></CardBody>
                  : fImg.length === 0
                    ? <CardBody><EmptyState icon={Scan} title="No imaging orders" description="Create an imaging request." action={<Button onClick={openImg}><Plus className="h-4 w-4" /> Imaging</Button>} /></CardBody>
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
        </div>

      </div> {/* end relative wrapper */}

      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
};

export default Orders;
