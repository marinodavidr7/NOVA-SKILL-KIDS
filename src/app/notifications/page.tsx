import { Card, CardContent } from "@/components/ui/card";
import { Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { getNotifications, Notification } from "@/lib/actions/notifications";
import NotificationCard from '@/components/notifications/NotificationCard';

export const dynamic = 'force-dynamic'; // Ensures this page isn't statically cached so alerts are always fresh

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'alert': return "bg-rose-100";
      case 'success': return "bg-emerald-100";
      default: return "bg-blue-100";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20">
          <Bell className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notificaciones</h1>
          <p className="text-sm text-slate-500 mt-1">
            Centro de alertas y avisos del sistema extraídos en tiempo real.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notif: Notification) => (
          <NotificationCard 
            key={notif.id}
            notification={notif}
            icon={getIcon(notif.type)}
            bgClass={getBg(notif.type)}
          />
        ))}
      </div>
    </div>
  );
}
