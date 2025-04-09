import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/frontend/ui'

export function AbortPrompt({
  isVisible,
  onCancel,
  onConfirm,
}: {
  isVisible: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Dialog open={isVisible}>
      <DialogPortal>
        <DialogOverlay onClick={onCancel} />
        <DialogContent onEscapeKeyDown={onCancel} aria-describedby={undefined}>
          <DialogTitle>If you quit now your result will be DFNed</DialogTitle>
          <DialogFooter>
            <DialogClose version='secondary' onClick={onConfirm}>
              Quit
            </DialogClose>
            <DialogClose version='primary' onClick={onCancel}>
              Resume
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
