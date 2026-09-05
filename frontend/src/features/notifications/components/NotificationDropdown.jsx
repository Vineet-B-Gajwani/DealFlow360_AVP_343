import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 focus:outline-none"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-slate-700/60 flex justify-between items-center bg-slate-800/30">
            <h3 className="font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                You're all caught up!
              </div>
            ) : (
              notifications.map(notification => (
                <Link
                  key={notification._id}
                  to={notification.link || '#'}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block p-3 rounded-lg transition-colors ${
                    !notification.isRead ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    {!notification.isRead && (
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-500 shrink-0"></div>
                    )}
                    <div className={!notification.isRead ? '' : 'ml-5'}>
                      <p className={`text-sm ${!notification.isRead ? 'font-bold text-white' : 'text-slate-300'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
