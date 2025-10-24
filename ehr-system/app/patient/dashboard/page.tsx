'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { appointmentAPI, prescriptionAPI } from '@/lib/api';
import { IAppointment, IPrescription } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';

const navItems = [
  {
    href: '/patient/dashboard',
    label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    href: '/patient/appointments',
    label: 'Appointments',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
  {
    href: '/patient/prescriptions',
    label: 'Prescriptions',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    href: '/patient/profile',
    label: 'Profile',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  },
];

export default function PatientDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'patient')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'patient') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [appts, prescs] = await Promise.all([
        appointmentAPI.getMyAppointments(true),
        prescriptionAPI.getMyPrescriptions(),
      ]);
      setAppointments(appts.slice(0, 5));
      setPrescriptions(prescs.slice(0, 5));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {user.name}!</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{appointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{prescriptions.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Status</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">
                  {user.medicalHistory ? 'Complete' : 'Incomplete'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link href="/patient/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </Link>
            </div>
            {loadingData ? (
              <p className="text-gray-500">Loading...</p>
            ) : appointments.length === 0 ? (
              <p className="text-gray-500">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div key={apt._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{apt.doctor?.name}</p>
                        <p className="text-sm text-gray-600">{apt.doctor?.specialization}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(apt.date), 'MMM dd, yyyy')} at {apt.startTime}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Prescriptions</h2>
              <Link href="/patient/prescriptions" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </Link>
            </div>
            {loadingData ? (
              <p className="text-gray-500">Loading...</p>
            ) : prescriptions.length === 0 ? (
              <p className="text-gray-500">No prescriptions yet</p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((presc) => (
                  <div key={presc._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Dr. {presc.doctor?.name}</p>
                        <p className="text-sm text-gray-600">
                          {presc.medications.length} medication{presc.medications.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Issued: {format(new Date(presc.issuedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Link
                        href={`/patient/prescriptions/${presc._id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/patient/appointments/book"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Book New Appointment
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
