import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatientById, clearCurrentPatient } from '../store/slices/patientSlice';
import { ArrowLeft, Edit, Activity, HeartPulse, FileText, User } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPatient, loading, error } = useSelector((state) => state.patients);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchPatientById(id));
    return () => { dispatch(clearCurrentPatient()); };
  }, [dispatch, id]);

  const calculateAge = (dob) => {
    if (!dob) return '-';
    return differenceInYears(new Date(), new Date(dob));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Loading patient profile...</p>
        </div>
      </div>
    );
  }

  if (error || !currentPatient) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="text-destructive font-medium">{error || 'Patient not found'}</div>
        <button onClick={() => navigate('/patients')} className="flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
        </button>
      </div>
    );
  }

  const patient = currentPatient;

  return (
    <div className="space-y-6">
      {/* Header / Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/patients')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Patients
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <User className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {patient.firstName} {patient.lastName}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              <span>MRN: <span className="font-mono text-foreground">{patient.id.substring(0, 8)}</span></span>
              <span>DOB: <span className="font-medium text-foreground">{patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}</span></span>
              <span>Age: <span className="font-medium text-foreground">{calculateAge(patient.dateOfBirth)}</span></span>
              <span>Gender: <span className="font-medium text-foreground">{patient.gender}</span></span>
            </div>
          </div>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-muted h-10 px-4 py-2">
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['overview', 'insurance', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                ${activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-1 border border-border bg-card rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground">
                <Activity className="mr-2 h-5 w-5 text-primary" /> Contact Information
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="grid grid-cols-3">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="col-span-2 font-medium text-foreground">{patient.contactInformation?.phone || 'Not provided'}</dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="col-span-2 font-medium text-foreground truncate" title={patient.contactInformation?.email}>{patient.contactInformation?.email || 'Not provided'}</dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="col-span-2 font-medium text-foreground">{patient.contactInformation?.address || 'Not provided'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'insurance' && (
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm max-w-2xl">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Insurance Details</h3>
            {patient.insuranceDetails ? (
              <dl className="space-y-4 text-sm">
                <div className="grid grid-cols-3 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Provider</dt>
                  <dd className="col-span-2 font-medium text-foreground">{patient.insuranceDetails.provider || 'N/A'}</dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="text-muted-foreground">Policy Number</dt>
                  <dd className="col-span-2 font-mono font-medium text-foreground">{patient.insuranceDetails.policyNumber || 'N/A'}</dd>
                </div>
              </dl>
            ) : (
               <div className="p-4 bg-muted/30 rounded-md text-sm text-muted-foreground border border-dashed border-border/60">
                 No insurance information provided.
               </div>
            )}
          </div>
        )}
        
        {activeTab === 'history' && (
           <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <HeartPulse className="mr-2 h-5 w-5 text-primary" /> Medical History
              </h3>
              <button className="text-sm font-medium text-primary hover:underline">Add Entry</button>
             </div>
             <div className="p-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-md">
               No medical history documented yet. Use the API to manage history.
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
