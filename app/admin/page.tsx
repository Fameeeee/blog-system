/**
 * Admin Root Page - Redirect to Dashboard
 * 
 * This page automatically redirects to /admin/dashboard
 * Middleware will handle authentication and redirect to login if needed
 */

import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/dashboard');
}
