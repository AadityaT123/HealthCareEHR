import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPatients, createPatient, deletePatient } from '../store/slices/patientSlice';
import { Users, Search, Plus, Trash2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  PageHeader, Button, Card, CardBody, Modal,
  Input, Select, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Spinner, EmptyState, Alert,
} from '../components/ui';
import { format, differenceInYears } from 'date-fns';

const EMPTY_FORM = {
  firstName: '', lastName: '', dateOfBirth: '', gender: '',
  contactInformation: { phone: '', email: '', address: '' },
  bloodType: '', emergencyContact: '',
};

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const PAGE_SIZE = 12;

const PatientsList = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { list: patients, loading, saving, error } = useSelector((s) => s.patients);

  const [search,     setSearch]     = useState('');
  const [genderFilt, setGenderFilt] = useState('');
  const [page,       setPage]       = useState(1);
  const [addOpen,    setAddOpen]    = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [formErr,    setFormErr]    = useState('');
  const [success,    setSuccess]    = useState('');

  useEffect(() => { dispatch(fetchPatients()); }, [dispatch]);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = patients.filter((p) => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) ||
      String(p.id).includes(search);
    const matchGender = !genderFilt || p.gender === genderFilt;
    return matchSearch && matchGender;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  // ── Form helpers ─────────────────────────────────────────────────────────
  const setField = (path, value) => {
    setForm((f) => {
      const parts = path.split('.');
      if (parts.length === 1) return { ...f, [path]: value };
      return { ...f, [parts[0]]: { ...f[parts[0]], [parts[1]]: value } };
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormErr('');
    if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.gender) {
      setFormErr('First name, last name, date of birth and gender are required.');
      return;
    }
    const result = await dispatch(createPatient(form));
    if (createPatient.fulfilled.match(result)) {
      setSuccess('Patient added successfully.');
      setAddOpen(false);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setFormErr(result.payload || 'Failed to create patient.');
    }
  };

  const handleDelete = async () => {
    await dispatch(deletePatient(deleteId));
    setDeleteId(null);
  };

  const calcAge = (dob) => {
    if (!dob) return '—';
    try { return `${differenceInYears(new Date(), new Date(dob))} yrs`; }
    catch { return '—'; }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} total registered patients`}
        action={
          <Button onClick={() => { setForm(EMPTY_FORM); setFormErr(''); setAddOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Patient
          </Button>
        }
      />

      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert variant="error">{typeof error === 'string' ? error : 'Failed to load patients.'}</Alert>}

      {/* Filters */}
      <Card>
        <CardBody className="py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                placeholder="Search by name or ID…"
                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <select
              value={genderFilt}
              onChange={(e) => { setGenderFilt(e.target.value); resetPage(); }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <CardBody><div className="flex justify-center py-16"><Spinner size="lg" /></div></CardBody>
        ) : paginated.length === 0 ? (
          <CardBody>
            <EmptyState
              icon={Users}
              title="No patients found"
              description={search ? 'Try adjusting your search or filter.' : 'Add your first patient to get started.'}
              action={!search && (
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Patient
                </Button>
              )}
            />
          </CardBody>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Patient</Th>
                  <Th>MRN</Th>
                  <Th>Gender</Th>
                  <Th>Age / DOB</Th>
                  <Th>Contact</Th>
                  <Th>Blood Type</Th>
                  <Th className="w-16"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginated.map((p) => (
                  <Tr key={p.id} onClick={() => navigate(`/patients/${p.id}`)}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
                          {p.firstName?.[0]}{p.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">{p.firstName} {p.lastName}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><span className="font-mono text-xs text-muted-foreground">{String(p.id).padStart(8, '0')}</span></Td>
                    <Td>{p.gender ?? '—'}</Td>
                    <Td>
                      <span>{calcAge(p.dateOfBirth)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {p.dateOfBirth ? format(new Date(p.dateOfBirth), 'MMM dd, yyyy') : '—'}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs text-muted-foreground">
                        {p.contactInformation?.phone || p.phone || '—'}
                      </span>
                    </Td>
                    <Td>
                      {p.bloodType ? (
                        <Badge variant="info">{p.bloodType}</Badge>
                      ) : <span className="text-muted-foreground">—</span>}
                    </Td>
                    <Td>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete patient"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 rounded-md border border-input flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-foreground px-2">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 rounded-md border border-input flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ── Add Patient Modal ── */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Patient" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          {formErr && <Alert variant="error">{formErr}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" required value={form.firstName}
              onChange={(e) => setField('firstName', e.target.value)} placeholder="e.g. John" />
            <Input label="Last Name" required value={form.lastName}
              onChange={(e) => setField('lastName', e.target.value)} placeholder="e.g. Doe" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Date of Birth" required type="date" value={form.dateOfBirth}
              onChange={(e) => setField('dateOfBirth', e.target.value)} />
            <Select label="Gender" required value={form.gender}
              onChange={(e) => setField('gender', e.target.value)}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" type="tel" value={form.contactInformation.phone}
              onChange={(e) => setField('contactInformation.phone', e.target.value)}
              placeholder="+1 (555) 000-0000" />
            <Input label="Email" type="email" value={form.contactInformation.email}
              onChange={(e) => setField('contactInformation.email', e.target.value)}
              placeholder="patient@example.com" />
          </div>

          <Input label="Address" value={form.contactInformation.address}
            onChange={(e) => setField('contactInformation.address', e.target.value)}
            placeholder="Street, City, State, ZIP" />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Blood Type" value={form.bloodType}
              onChange={(e) => setField('bloodType', e.target.value)}>
              <option value="">Unknown</option>
              {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
            </Select>
            <Input label="Emergency Contact" value={form.emergencyContact}
              onChange={(e) => setField('emergencyContact', e.target.value)}
              placeholder="Name & phone" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add Patient'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Patient" size="sm">
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to permanently delete this patient and all associated records? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
        </div>
      </Modal>
    </div>
  );
};

export default PatientsList;
