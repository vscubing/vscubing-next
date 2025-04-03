'use client'
import { SecondaryButton, ShareIcon, toast } from '@/app/_components/ui'
import { copyToClipboard } from '@/app/_utils/copyToClipboard'

export function ShareSolveButton() {
  return (
    <SecondaryButton size='iconSm' onClick={copyCurrentHref}>
      <ShareIcon />
    </SecondaryButton>
  )
}

function copyCurrentHref() {
  copyToClipboard(window.location.href).then(
    () =>
      toast({
        title: 'Link copied',
        description: 'You can now share the link with your friends.',
        duration: 'short',
      }),
    () =>
      toast({
        title: 'Uh-oh! An error occured while copying the link',
        description: 'Try changing permissions in your browser settings.',
      }),
  )
}
