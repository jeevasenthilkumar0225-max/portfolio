import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPortfolioData } from '@/lib/data';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || token !== 'js-portfolio-authenticated-admin-session') {
    redirect('/admin/login');
  }

  const portfolioData = getPortfolioData();

  return <AdminDashboard initialData={portfolioData} />;
}

