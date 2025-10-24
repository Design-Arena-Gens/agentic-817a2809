'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { prescriptionAPI } from '@/lib/api';
import { IPrescription } from '@/types';
import { format } from 'date-fns';
import { generatePrescriptionPDF } from '@/lib/pdfGenerator';

const navItems = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/patient/appointments', label: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: '/patient/prescriptions', label: 'Prescriptions', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { href: '/patient/profile', label: 'Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

export default function PatientPrescriptions() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'patient')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'patient') {
      loadPrescriptions();
    }
  }, [user]);

  const loadPrescriptions = async () => {
    try {
      const prescs = await prescriptionAPI.getMyPrescriptions();
      setPrescriptions(prescs);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDownloadPDF = (prescription: IPrescription) => {
    const doc = generatePrescriptionPDF(prescription);
    doc.save(`prescription-${prescription._id}.pdf`);
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Prescriptions</h1>

        {loadingData ? (
          <p className="text-gray-500">Loading...</p>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No prescriptions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((presc) => (
              <div key={presc._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Dr. {presc.doctor?.name}</h3>
                    <p className="text-gray-600">{presc.doctor?.specialization}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Issued: {format(new Date(presc.issuedAt), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF(presc)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download PDF</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Medications:</h4>
                  <div className="space-y-3">
                    {presc.medications.map((med, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900">{med.name}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                          <p><span className="font-medium">Dose:</span> {med.dose}</p>
                          <p><span className="font-medium">Frequency:</span> {med.frequency}</p>
                          <p><span className="font-medium">Duration:</span> {med.duration}</p>
                        </div>
                        {med.instructions && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Instructions:</span> {med.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {presc.notes && (
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {presc.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
