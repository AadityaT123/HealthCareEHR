import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from '../store/slices/patientSlice';
import { Search, Plus, User, FileText, Activity } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const PatientsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: patients, loading, error } = useSelector((state) => state.patients);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const calculateAge = (dob) => {
    if (!dob) return '-';
    return differenceInYears(new Date(), new Date(dob));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patients list</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage patient records and demographics.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> New Patient
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patients by name or ID..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {patients?.length || 0} Total Patients
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Patient Name</th>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Age / Gender</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 pr-8 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                      <p>Loading patient records...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-destructive">
                    {typeof error === 'string' ? error : 'Failed to load patients'}
                  </td>
                </tr>
              ) : patients?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    <User className="mx-auto h-8 w-8 mb-3 opacity-20" />
                    <p>No patients found. Add a new patient to get started.</p>
                  </td>
                </tr>
              ) : (
                patients?.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{patient.firstName} {patient.lastName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">DOB: {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {patient.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {calculateAge(patient.dateOfBirth)} yrs <span className="text-muted-foreground px-1">•</span> {patient.gender}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {patient.contactInformation?.phone || 'No phone'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View Details">
                          <User className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Clinical Notes">
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/10">
          <div>Showing page 1 of 1</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsList;
//patients list