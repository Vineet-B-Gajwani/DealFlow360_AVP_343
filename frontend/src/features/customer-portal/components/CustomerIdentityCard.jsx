import React from 'react';

/**
 * CustomerIdentityCard
 *
 * Displays the authenticated customer's identity and business profile.
 *
 * Props:
 *   profile {object} - From GET /api/portal/me
 *     - identity  { name, email, role, memberSince }
 *     - profile   { companyName, phone, address, portalActivatedAt }
 */
function CustomerIdentityCard({ profile }) {
  if (!profile) return null;

  const { identity, profile: businessProfile } = profile;

  const memberSince = identity?.memberSince
    ? new Date(identity.memberSince).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const fields = [
    {
      id: 'identity-email',
      label: 'Email Address',
      value: identity?.email,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      id: 'identity-company',
      label: 'Company',
      value: businessProfile?.companyName || '—',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'identity-phone',
      label: 'Phone',
      value: businessProfile?.phone || '—',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 1.18l3-.02a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.16 6.16l1.02-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
    {
      id: 'identity-member-since',
      label: 'Member Since',
      value: memberSince,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="portal-identity-card">
      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-6">
        <div className="portal-avatar" aria-hidden="true">
          {identity?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{identity?.name}</h2>
          <span className="portal-role-badge">Customer</span>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.id} id={field.id} className="portal-identity-field">
            <div className="portal-identity-field-icon">{field.icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 leading-none mb-0.5">{field.label}</p>
              <p className="text-sm text-slate-200 font-medium truncate">{field.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Address — full width if present */}
      {businessProfile?.address && (
        <div id="identity-address" className="mt-3 pt-3 border-t border-slate-700/60">
          <p className="text-xs text-slate-500 mb-0.5">Address</p>
          <p className="text-sm text-slate-200">{businessProfile.address}</p>
        </div>
      )}
    </div>
  );
}

export default CustomerIdentityCard;
