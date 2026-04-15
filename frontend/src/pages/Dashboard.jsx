import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Users, FlaskConical, Scan, Pill, Activity, ArrowRight, AlertCircle } from 'lucide-react';
import { fetchPatients } from '../store/slices/patientSlice';
import { Card, CardBody, Spinner } from '../components/ui';
import { format } from 'date-fns';

const StatCard = ({ label, value, icon: Icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-card border border-border rounded-xl p-6 shadow-sm flex items-start gap-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group`}
  >
    <div className={`h-13 w-13 rounded-xl flex items-center justify-center p-3 ${color}`}>
      <Icon className="h-7 w-7" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
    <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors mt-1" />
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: patients, loading } = useSelector((s) => s.patients);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  // Recent patients (latest 5)
  const recent = [...(patients || [])].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-xl bg-gradient-to-br from-primary to-blue-700 p-8 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, Dr. Smith</h1>
        <p className="mt-1 text-blue-100 text-sm">
          {format(new Date(), "EEEE, MMMM do yyyy")} — Here's your clinical overview for today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={patients.length} icon={Users} color="bg-blue-100 text-blue-600" onClick={() => navigate('/patients')} />
        <StatCard label="Clinical Documentation" value="—" icon={Activity} color="bg-indigo-100 text-indigo-600" onClick={() => navigate('/documentation')} />
        <StatCard label="Active Orders" value="—" icon={FlaskConical} color="bg-purple-100 text-purple-600" onClick={() => navigate('/orders')} />
        <StatCard label="Prescriptions" value="—" icon={Pill} color="bg-green-100 text-green-600" onClick={() => navigate('/medications')} />
      </div>

      {/* Recent Patients */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Patients</h2>
          <button onClick={() => navigate('/patients')} className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : patients.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No patients registered yet.</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-3">
            {recent.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/patients/${p.id}`)}
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:shadow-sm hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                  {p.firstName?.[0]}{p.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{p.firstName} {p.lastName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.gender} • {p.dateOfBirth ? format(new Date(p.dateOfBirth), 'MMM dd, yyyy') : 'DOB unknown'}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'New Patient', icon: Users, path: '/patients', color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' },
            { label: 'New Encounter', icon: Activity, path: '/documentation', color: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100' },
            { label: 'Lab Order', icon: FlaskConical, path: '/orders', color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100' },
            { label: 'Prescribe', icon: Pill, path: '/medications', color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' },
          ].map(({ label, icon: Icon, path, color }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`border rounded-lg p-4 flex flex-col items-center gap-2 transition-colors ${color}`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
