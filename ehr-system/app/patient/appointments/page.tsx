'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { appointmentAPI } from '@/lib/api';
import { IAppointment } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';

const navItems = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/patient/appointments', label: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: '/patient/prescriptions', label: 'Prescriptions', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { href: '/patient/profile', label: 'Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

export default function PatientAppointments() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming'>('upcoming');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'patient')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'patient') {
      loadAppointments();
    }
  }, [user, filter]);

  const loadAppointments = async () => {
    try {
      const appts = await appointmentAPI.getMyAppointments(filter === 'upcoming');
      setAppointments(appts);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.cancel(id);
        loadAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment');
      }
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <Link
            href="/patient/appointments/book"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg"
          >
            Book Appointment
          </Link>
        </div>

        <div className="mb-6 flex space-x-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
        </div>

        {loadingData ? (
          <p className="text-gray-500">Loading...</p>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{apt.doctor?.name}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">{apt.doctor?.specialization}</p>
                    <p className="text-gray-900 font-medium">
                      {format(new Date(apt.date), 'EEEE, MMMM dd, yyyy')} at {apt.startTime}
                    </p>
                    {apt.reason && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Reason:</span> {apt.reason}
                      </p>
                    )}
                    {apt.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Notes:</span> {apt.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {apt.status === 'pending' || apt.status === 'confirmed' ? (
                      <button
                        onClick={() => handleCancel(apt._id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
