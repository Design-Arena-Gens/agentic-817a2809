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
  { href: '/doctor/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/doctor/appointments', label: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: '/doctor/prescriptions', label: 'Prescriptions', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
];

export default function DoctorAppointments() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'doctor')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'doctor') {
      loadAppointments();
    }
  }, [user, filter]);

  const loadAppointments = async () => {
    try {
      const appts = await appointmentAPI.getMyAppointments(false);
      if (filter === 'all') {
        setAppointments(appts);
      } else {
        setAppointments(appts.filter(a => a.status === filter));
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await appointmentAPI.updateStatus(id, status);
      loadAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update appointment status');
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Appointments</h1>

        <div className="mb-6 flex space-x-2">
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
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'confirmed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Confirmed
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
                      <h3 className="text-lg font-semibold text-gray-900">{apt.patient?.name}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {format(new Date(apt.date), 'EEEE, MMMM dd, yyyy')} at {apt.startTime}
                    </p>
                    {apt.reason && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Reason:</span> {apt.reason}
                      </p>
                    )}
                    {apt.patient?.medicalHistory && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Medical History:</span> {apt.patient.medicalHistory}
                      </p>
                    )}
                    {apt.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Notes:</span> {apt.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    {apt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(apt._id, 'confirmed')}
                          className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(apt._id, 'cancelled')}
                          className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-medium"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(apt._id, 'completed')}
                          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium"
                        >
                          Mark Complete
                        </button>
                        <Link
                          href={`/doctor/prescriptions/create?appointmentId=${apt._id}&patientId=${apt.patient?._id}`}
                          className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded font-medium text-center"
                        >
                          Issue Prescription
                        </Link>
                      </>
                    )}
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
