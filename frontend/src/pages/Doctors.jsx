import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, createDoctor } from '../store/slices/doctorSlice';
import { Stethoscope, Plus, Search, ToggleLeft } from 'lucide-react';
import {
  PageHeader, Button, Card, CardBody, Modal, Input, Select, Textarea,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, EmptyState, Alert,
} from '../components/ui';

const EMPTY_FORM = {
  firstName: '', lastName: '', specialty: '', department: '',
  phone: '', email: '', licenseNumber: '',
};

const SPECIALTIES = [
  'General Practice', 'Internal Medicine', 'Cardiology', 'Neurology',
  'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology',
  'Surgery', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'Ophthalmology', 'Urology', 'Emergency Medicine',
];

const Doctors = () => {
  const dispatch = useDispatch();
  const { list: doctors, loading, saving, error } = useSelector((s) => s.doctors);

  const [search,  setSearch]  = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { dispatch(fetchDoctors()); }, [dispatch]);

  const filtered = doctors.filter((d) => {
    const name = `${d.firstName} ${d.lastName} ${d.specialty || ''}`.toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormErr('');
    if (!form.firstName || !form.lastName || !form.specialty) {
      setFormErr('First name, last name and specialty are required.');
      return;
    }
    const result = await dispatch(createDoctor(form));
    if (createDoctor.fulfilled.match(result)) {
      setSuccess('Doctor added successfully.');
      setAddOpen(false);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setFormErr(result.payload || 'Failed to add doctor.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Doctors"
        subtitle={`${doctors.length} clinical staff members`}
        action={
          <Button onClick={() => { setForm(EMPTY_FORM); setFormErr(''); setAddOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Doctor
          </Button>
        }
      />

      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert variant="error">{typeof error === 'string' ? error : 'Failed to load doctors.'}</Alert>}

      {/* Search */}
      <Card>
        <CardBody className="py-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialty…"
              className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <CardBody><div className="flex justify-center py-16"><Spinner size="lg" /></div></CardBody>
        ) : filtered.length === 0 ? (
          <CardBody>
            <EmptyState icon={Stethoscope} title="No doctors found"
              description="Add clinical staff to get started."
              action={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Add Doctor</Button>}
            />
          </CardBody>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Doctor</Th>
                <Th>Specialty</Th>
                <Th>Department</Th>
                <Th>License #</Th>
                <Th>Contact</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((d) => (
                <Tr key={d.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
                        {d.firstName?.[0]}{d.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium">Dr. {d.firstName} {d.lastName}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>{d.specialty || '—'}</Td>
                  <Td className="text-muted-foreground">{d.department || '—'}</Td>
                  <Td><span className="font-mono text-xs">{d.licenseNumber || '—'}</span></Td>
                  <Td className="text-xs text-muted-foreground">{d.email || d.phone || '—'}</Td>
                  <Td>
                    <Badge variant={d.isActive === false ? 'danger' : 'success'}>
                      {d.isActive === false ? 'Inactive' : 'Active'}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      {/* Add Doctor Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Doctor" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          {formErr && <Alert variant="error">{formErr}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" required value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
            <Input label="Last Name" required value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
          </div>

          <Select label="Specialty" required value={form.specialty}
            onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}>
            <option value="">Select specialty…</option>
            {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
          </Select>

          <Input label="Department" value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            placeholder="e.g. Cardiology Ward" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" type="tel" value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <Input label="Email" type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>

          <Input label="License Number" value={form.licenseNumber}
            onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
            placeholder="e.g. MD-123456" />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add Doctor'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Doctors;
