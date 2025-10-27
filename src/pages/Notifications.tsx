import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  Syringe, 
  Heart, 
  Pill, 
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight
} from "lucide-react";

/**
 * Mock notifications data
 */
const mockNotifications = [
  {
    id: 1,
    type: "vaccination_due",
    title: "Vaccination Due",
    description: "Your dog's rabies vaccination is due in 2 weeks",
    priority: "high",
    category: "vaccination",
    date: "2025-11-10",
    icon: Syringe,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: 2,
    type: "vet_appointment",
    title: "Upcoming Vet Visit",
    description: "Annual checkup scheduled for tomorrow at 2:00 PM",
    priority: "medium",
    category: "appointment",
    date: new Date().toISOString(),
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: 3,
    type: "medication_reminder",
    title: "Medication Reminder",
    description: "Give heartworm prevention pill today",
    priority: "high",
    category: "medication",
    date: new Date().toISOString(),
    icon: Pill,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: 4,
    type: "health_check",
    title: "Health Check Completed",
    description: "Quarterly wellness exam completed successfully",
    priority: "low",
    category: "health",
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    read: true,
  },
  {
    id: 5,
    type: "vaccination_completed",
    title: "Vaccination Recorded",
    description: "DHPP vaccination administered successfully",
    priority: "low",
    category: "vaccination",
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    icon: Syringe,
    color: "text-green-600",
    bgColor: "bg-green-50",
    read: true,
  },
  {
    id: 6,
    type: "appointment_reminder",
    title: "Appointment Reminder",
    description: "Dental cleaning scheduled for next Monday",
    priority: "medium",
    category: "appointment",
    date: new Date(Date.now() + 604800000).toISOString(),
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: 7,
    type: "health_alert",
    title: "Weight Update",
    description: "Your pet has lost 2 lbs since last checkup",
    priority: "high",
    category: "health",
    date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

const Notifications = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    if (filter === "high") return notification.priority === "high";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "high") {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
          High Priority
        </span>
      );
    }
    if (priority === "medium") {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
          Medium Priority
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(petId ? `/pet/${petId}` : "/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="flex-1"
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="flex-1"
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === "high" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("high")}
              className="flex-1"
            >
              High Priority ({notifications.filter((n) => n.priority === "high").length})
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-2xl mx-auto px-6 py-6">
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No notifications
              </h3>
              <p className="text-sm text-slate-600">
                You're all caught up!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                const isUnread = !notification.read;
                
                return (
                  <Card 
                    key={notification.id}
                    className={`p-4 transition-all hover:shadow-md ${isUnread ? 'border-primary/20 bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-full ${notification.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${notification.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                                {notification.title}
                              </h3>
                              {isUnread && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-2">
                              {notification.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {getPriorityBadge(notification.priority)}
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(notification.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

