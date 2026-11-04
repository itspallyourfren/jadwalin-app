// src/components/DeviceSimulatorWrapper.tsx - Minimal Dev Viewport Switcher & Notification Toast
import React from 'react'
import { BellRing, Monitor, Smartphone, X } from 'lucide-react'
import { useTrackerStore } from '../store/useTrackerStore'

type DeviceSimulatorWrapperProps = {
  children: (isSimulatedMobile: boolean) => React.ReactNode
  onOpenTaskFromNotification?: (taskId: string) => void
}

export const DeviceSimulatorWrapper: React.FC<DeviceSimulatorWrapperProps> = ({
  children,
  onOpenTaskFromNotification,
}) => {
  const desktopPreviewMode = useTrackerStore((s) => s.desktopPreviewMode)
  const setDesktopPreviewMode = useTrackerStore((s) => s.setDesktopPreviewMode)
  const simulatedNotifications = useTrackerStore((s) => s.simulatedNotifications)
  const triggerSampleNotification = useTrackerStore((s) => s.triggerSampleNotification)
  const dismissSimulatedNotification = useTrackerStore((s) => s.dismissSimulatedNotification)

  const isPhoneFrame = desktopPreviewMode === 'PHONE_FRAME'

  const renderNotificationToast = () => {
    if (simulatedNotifications.length === 0) return null
    const latest = simulatedNotifications[0]
    return (
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[380px] pointer-events-auto">
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
      {/* Slim Desktop Preview Bar (Hidden on actual mobile devices) */}
      <div className="hidden md:flex items-center justify-between px-4 py-1.5 bg-[#F2ECE1] border-b border-[#E2D9C8] text-xs">
        <span className="font-semibold text-[#5C5148]">Tampilan Layar</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => triggerSampleNotification()}
            className="px-2.5 py-1 rounded-lg bg-[#FFFDF9] hover:bg-[#E2D9C8]/50 border border-[#E2D9C8] text-[#1E1915] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5 text-[#D4532F]" />
            <span>Tes Notifikasi</span>
          </button>

          <div className="flex items-center bg-[#E2D9C8]/60 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setDesktopPreviewMode('FULL_RESPONSIVE')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                !isPhoneFrame ? 'bg-[#FFFDF9] text-[#1E1915] shadow-2xs' : 'text-[#5C5148]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Penuh</span>
            </button>
            <button
              type="button"
              onClick={() => setDesktopPreviewMode('PHONE_FRAME')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isPhoneFrame ? 'bg-[#FFFDF9] text-[#1E1915] shadow-2xs' : 'text-[#5C5148]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Layar HP</span>
            </button>
          </div>
        </div>
      </div>

      {renderNotificationToast()}

      {isPhoneFrame ? (
        <>
          {/* Tampilan layar penuh tanpa mockup saat dibuka di HP sungguhan */}
          <div className="flex md:hidden flex-1 flex-col min-h-0">
            {children(true)}
          </div>

          {/* Mockup bingkai HP khusus saat dibuka di browser Desktop */}
          <div className="hidden md:flex flex-1 bg-[#E8E1D3] py-5 px-4 items-center justify-center overflow-auto">
            <div className="w-[400px] h-[844px] bg-[#FAF7F2] rounded-[40px] border-[8px] border-[#1E1915] shadow-xl overflow-hidden flex flex-col relative shrink-0">
              <div className="h-6 bg-[#FAF7F2] px-5 flex items-center justify-between text-xs font-semibold text-[#5C5148] shrink-0">
                <span>09:41</span>
                <div className="w-16 h-3 bg-[#1E1915] rounded-full" />
                <span>100%</span>
              </div>
              <div className="flex-1 flex flex-col overflow-hidden relative">{children(true)}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">{children(false)}</div>
      )}
    </div>
  )
}
