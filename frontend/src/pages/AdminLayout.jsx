import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/common/Sidebar';


export default function AdminLayout() {
  return (
    <div className="flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}