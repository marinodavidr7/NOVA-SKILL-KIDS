'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { markNotificationAsRead } from "@/lib/actions/notifications";

type NotificationCardProps = {
  notification: any;
  icon: React.ReactNode;
  bgClass: string;
};

export default function NotificationCard({ notification, icon, bgClass }: NotificationCardProps) {
  const [isUnread, setIsUnread] = useState(notification.unread);

  const handleClick = async () => {
    if (!isUnread || notification.id === 'all_good') return;

    // Optimistic UI update
    setIsUnread(false);
    
    // Dispatch global event so Header updates
    window.dispatchEvent(new Event('notification-read'));

    // Call server action
    await markNotificationAsRead(notification.id);
  };

  return (
    <Card 
      onClick={handleClick}
      className={`border-0 shadow-sm transition-all duration-300 ${isUnread ? 'bg-white hover:shadow-md cursor-pointer hover:-translate-y-0.5' : 'bg-slate-50/50 opacity-80'}`}
    >
      <CardContent className="p-4 sm:p-6 flex gap-4">
        <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bgClass} transition-opacity ${!isUnread ? 'opacity-60' : ''}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={`font-bold transition-colors ${isUnread ? 'text-slate-800' : 'text-slate-500'}`}>
              {notification.title}
            </h3>
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap ml-4">
              {notification.time}
            </span>
          </div>
          <p className={`text-sm mt-1 transition-colors ${isUnread ? 'text-slate-600' : 'text-slate-400'}`}>
            {notification.description}
          </p>
        </div>
        {isUnread && (
          <div className="flex items-center justify-center animate-in fade-in zoom-in">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
