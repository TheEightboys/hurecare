import { useEffect, useState, Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import type { Session } from "@supabase/supabase-js";

// Lazy loaded pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ClinicalNotesPage = lazy(() => import("./pages/ClinicalNotesPage"));
const SOAPNoteEditor = lazy(() => import("./pages/SOAPNoteEditor"));
const AppointmentsPage = lazy(() => import("./pages/AppointmentsPage"));
const PatientVisitPage = lazy(() => import("./pages/PatientVisitPage"));
const IntakeFormsPage = lazy(() => import("./pages/IntakeFormsPage"));
const PatientIntakePublic = lazy(() => import("./pages/PatientIntakePublic"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const ClaimsPage = lazy(() => import("./pages/ClaimsPage"));
const ReferralNoteEditor = lazy(() => import("./pages/ReferralNoteEditor"));
const AdminNotesReportPage = lazy(() => import("./pages/AdminNotesReportPage"));
const PatientsPage = lazy(() => import("./pages/PatientsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const InsuranceSubmissionsPage = lazy(() => import("./pages/InsuranceSubmissionsPage"));
const InsuranceSubmitPublic = lazy(() => import("./pages/InsuranceSubmitPublic"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/intake/:token" element={<PatientIntakePublic />} />
              <Route path="/insurance-submit/:token" element={<InsuranceSubmitPublic />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
              <Route path="/patients/new" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />

              {/* Appointments */}
              <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
              <Route path="/appointments/:appointmentId/visit" element={<ProtectedRoute><PatientVisitPage /></ProtectedRoute>} />

              {/* Clinical Notes - Only accessible through appointments/patient visit */}
              <Route path="/clinical-notes/new" element={<ProtectedRoute><SOAPNoteEditor /></ProtectedRoute>} />
              <Route path="/clinical-notes/:id" element={<ProtectedRoute><SOAPNoteEditor /></ProtectedRoute>} />

              {/* Referral Notes */}
              <Route path="/referral-notes" element={<ProtectedRoute><ClinicalNotesPage /></ProtectedRoute>} />
              <Route path="/referral-notes/new" element={<ProtectedRoute><ReferralNoteEditor /></ProtectedRoute>} />
              <Route path="/referral-notes/:id" element={<ProtectedRoute><ReferralNoteEditor /></ProtectedRoute>} />

              {/* Intake Forms */}
              <Route path="/intake-forms" element={<ProtectedRoute><IntakeFormsPage /></ProtectedRoute>} />

              {/* Billing & Claims */}
              <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
              <Route path="/claims" element={<ProtectedRoute><ClaimsPage /></ProtectedRoute>} />
              <Route path="/insurance-submissions" element={<ProtectedRoute><InsuranceSubmissionsPage /></ProtectedRoute>} />

              {/* Admin Reports */}
              <Route path="/admin/incomplete-notes" element={<ProtectedRoute><AdminNotesReportPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />

              {/* Settings */}
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

