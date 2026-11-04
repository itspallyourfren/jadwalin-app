// src/components/DeviceSimulatorWrapper.tsx - Notification Toast & Root Layout Container
import React from 'react'
import { BellRing, X } from 'lucide-react'
import { useTrackerStore } from '../store/useTrackerStore'

type DeviceSimulatorWrapperProps = {
  children: (isSimulatedMobile: boolean) => React.ReactNode
  onOpenTaskFromNotification?: (taskId: string) => void
}

export const DeviceSimulatorWrapper: React.FC<DeviceSimulatorWrapperProps> = ({
  children,
  onOpenTaskFromNotification,
}) => {
  const simulatedNotifications = useTrackerStore((s) => s.simulatedNotifications)
  const dismissSimulatedNotification = useTrackerStore((s) => s.dismissSimulatedNotification)

  const renderNotificationToast = () => {
    if (simulatedNotifications.length === 0) return null
    const latest = simulatedNotifications[0]
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[380px] pointer-events-auto">
        <div className="bg-[#1E1915] text-[#FAF7F2] rounded-2xl p-3 shadow-lg border border-[#5C5148]/60 flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D4532F] text-white flex items-center justify-center shrink-0 mt-0.5">
            <BellRing className="w-4 h-4" strokeWidth={2} />
          </div>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => {
              if (latest.relatedTaskId && onOpenTaskFromNotification) {
                onOpenTaskFromNotification(latest.relatedTaskId)
              }
              dismissSimulatedNotification(latest.id)
            }}
          >
            <p className="text-xs font-bold text-white leading-snug truncate">{latest.title}</p>
            <p className="text-xs text-[#F2ECE1]/85 leading-snug mt-0.5 line-clamp-2">
              {latest.body}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dismissSimulatedNotification(latest.id)}
            aria-label="Tutup notifikasi"
            className="p-1 rounded-lg text-[#F2ECE1]/60 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] min-h-[100dvh] bg-[#FAF7F2] text-[#1E1915] flex flex-col overflow-hidden">
      {renderNotificationToast()}
      <div className="flex-1 flex flex-col min-h-0">{children(false)}</div>
    </div>
  )
}
