import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../features/auth/hooks/useAuth';

const ALL_MODULES = [
  { name: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPERATIONS'] },
  { name: 'Products', path: '/products', roles: ['ADMIN', 'SALES_REP', 'SALES_MANAGER'] },
  { name: 'Pricing Config', path: '/products/pricing-config', roles: ['ADMIN', 'SALES_MANAGER'] },
  { name: 'Quotations', path: '/quotations', roles: ['ADMIN', 'SALES_REP', 'SALES_MANAGER'] },
  { name: 'Approvals', path: '/approvals/dashboard', roles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS'] },
  { name: 'Inventory', path: '/inventory', roles: ['ADMIN', 'FINANCE_OPERATIONS'] },
  { name: 'Fulfillment', path: '/fulfillment', roles: ['ADMIN', 'FINANCE_OPERATIONS'] },
  { name: 'Subscriptions', path: '/subscriptions', roles: ['ADMIN', 'FINANCE_OPERATIONS'] },
  { name: 'Billing', path: '/billing', roles: ['ADMIN', 'FINANCE_OPERATIONS'] },
  { name: 'Invoices', path: '/invoices', roles: ['ADMIN', 'FINANCE_OPERATIONS'] },
  { name: 'Deal Health', path: '/deal-health', roles: ['ADMIN', 'SALES_MANAGER'] },
  { name: 'Reporting', path: '/reporting', roles: ['ADMIN', 'SALES_MANAGER'] },
];

function Sidebar() {
  const { user } = useAuth();

  const visibleModules = ALL_MODULES.filter(module => 
    module.roles.includes(user?.role)
  );

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <img src="/logo.jpg" alt="DealFlow360 Logo" className="w-8 h-8 rounded-lg mr-3 object-cover shadow-sm" />
        <h1 className="text-xl font-bold text-white tracking-wide">
          DealFlow<span className="text-brand-500">360</span>
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {visibleModules.map(module => (
            <li key={module.name}>
              <NavLink
                to={module.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                {module.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Your Role
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
            {user?.role?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
