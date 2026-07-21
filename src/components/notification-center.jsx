import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/actions";
import { PushPermissionControl } from "@/components/push-permission-control";
import { formatShortDate, formatTime } from "@/utils/dates";

export function NotificationCenter({ notifications, unreadCount, publicKey }) {
  const now = new Date();

  return (
    <details name="app-header-popover" className="group relative">
      <summary
        aria-label="Abrir centro de notificaciones"
        className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[color:var(--care-cloud)] bg-white px-4 text-sm font-semibold transition hover:border-[color:var(--care-teal)] [&::-webkit-details-marker]:hidden"
      >
        Avisos
        {unreadCount ? (
          <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--care-teal)] px-1.5 text-xs text-[color:var(--care-ink)]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </summary>
      <div className="absolute right-0 z-50 mt-3 w-[min(92vw,380px)] rounded-2xl border border-[color:var(--care-cloud)] bg-white p-4 shadow-[0_22px_70px_rgba(11,31,58,0.16)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Notificaciones</p>
            <p className="text-xs text-[color:var(--care-muted)]">Cuidados que requieren atención</p>
          </div>
          {unreadCount ? (
            <form action={markAllNotificationsReadAction}>
              <button className="text-xs font-semibold text-[color:var(--care-ink-soft)]" type="submit">
                Marcar todas
              </button>
            </form>
          ) : null}
        </div>

        <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
          {notifications.length ? (
            notifications.map((notification) => {
              const isUnread = !notification.readAt && notification.scheduledFor <= now;
              return (
              <article
                key={notification.id}
                className={`rounded-xl border p-3 ${
                  isUnread
                    ? "border-transparent bg-[color:var(--care-teal-soft)]"
                    : "border-[color:var(--care-cloud)] bg-white"
                }`}
              >
                <a href={notification.url} className="block">
                  <p className="text-sm font-semibold">{notification.title}</p>
                  <p className="mt-1 text-xs text-[color:var(--care-ink-soft)]">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[color:var(--care-muted)]">
                    {formatShortDate(notification.scheduledFor)} · {formatTime(notification.scheduledFor)}
                  </p>
                </a>
                {isUnread ? (
                  <form action={markNotificationReadAction} className="mt-2">
                    <input type="hidden" name="notificationId" value={notification.id} />
                    <button type="submit" className="text-xs font-semibold text-[color:var(--care-ink-soft)]">
                      Marcar como leída
                    </button>
                  </form>
                ) : null}
              </article>
              );
            })
          ) : (
            <p className="rounded-xl bg-[color:var(--care-canvas)] p-4 text-sm text-[color:var(--care-muted)]">
              No hay avisos programados.
            </p>
          )}
        </div>

        <div className="mt-4 border-t border-[color:var(--care-cloud)] pt-4">
          <PushPermissionControl publicKey={publicKey} />
        </div>
      </div>
    </details>
  );
}
