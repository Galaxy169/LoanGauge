import { useSelector } from 'react-redux';
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from '../services/notificationService';

export function useNotifications() {
  const userId = useSelector((state) => state.auth?.user?.id);

  const { data: response, isLoading } = useGetNotificationsQuery(userId, { skip: !userId });
  const [markRead] = useMarkNotificationReadMutation();

  const notifications = response?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, isLoading, markRead };
}