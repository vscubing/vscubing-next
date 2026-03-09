'use client'

import { toast } from '@/frontend/ui'
import { TextArea } from '@/frontend/ui/input'
import { UnderlineButton } from '@/frontend/ui/buttons'
import { UserBadges } from '@/frontend/shared/user-badges'
import { formatDate } from '@/lib/utils/format-date'
import { useTRPC, type RouterOutputs } from '@/lib/trpc/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useWcaAvatarUrl } from './use-wca-avatar-url'
import { LoadingSpinner } from '@/frontend/ui'
import DefaultAvatarIcon from '@/../public/images/default-avatar.icon.svg'

type Profile = RouterOutputs['profile']['getProfile']

export function UserInfoSection({ profile }: { profile: Profile }) {
  return (
    <div className='bg-black-80 flex gap-6 rounded-2xl p-6 sm:flex-col sm:items-center sm:p-4'>
      <ProfileAvatar wcaId={profile.wcaId} name={profile.name} />
      <div className='flex flex-1 flex-col sm:items-center'>
        <div className='mb-1 flex items-center gap-2'>
          <h2 className='title-h2'>{profile.name}</h2>
          <UserBadges
            user={{
              id: profile.id,
              name: profile.name,
              role: profile.role,
              wcaId: profile.wcaId,
              globalRecords: profile.globalRecords,
            }}
          />
        </div>
        <p className='text-grey-40 mb-4 text-base'>
          Member since {formatDate(profile.createdAt, 'long')}
        </p>
        <BioEditor profile={profile} />
      </div>
    </div>
  )
}

function ProfileAvatar({
  wcaId,
  name,
}: {
  wcaId: string | null
  name: string
}) {
  if (!wcaId) {
    return <DefaultAvatar />
  }

  return <WcaAvatar wcaId={wcaId} name={name} />
}

function WcaAvatar({ wcaId, name }: { wcaId: string; name: string }) {
  const { data: avatarUrl, isLoading } = useWcaAvatarUrl({ wcaId })

  if (isLoading) {
    return (
      <div className='bg-grey-100 flex h-60 w-60 shrink-0 items-center justify-center rounded-2xl sm:h-20 sm:w-20 md:h-50 md:w-50'>
        <LoadingSpinner />
      </div>
    )
  }

  if (!avatarUrl) {
    return <DefaultAvatar />
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl}
      alt={name}
      className='h-60 w-60 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20 md:h-50 md:w-50'
    />
  )
}

function DefaultAvatar() {
  return (
    <DefaultAvatarIcon className='h-60 w-60 shrink-0 rounded-2xl sm:h-20 sm:w-20 md:h-50 md:w-50' />
  )
}

function BioEditor({ profile }: { profile: Profile }) {
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(profile.bio)
  const [draft, setDraft] = useState(profile.bio)
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate: updateBio } = useMutation(
    trpc.profile.updateBio.mutationOptions({
      onMutate: async ({ bio: newBio }) => {
        setBio(newBio)
        setIsEditing(false)
      },
      onError: () => {
        setBio(profile.bio)
        toast({
          title: 'Failed to update bio',
          description: 'Please try again',
        })
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getProfile.queryKey(),
        })
      },
    }),
  )

  if (!profile.isOwnProfile && !bio) return null

  if (!profile.isOwnProfile) {
    return (
      <div className='flex flex-col gap-1'>
        <span className='text-grey-40 text-sm'>BIO</span>
        <p className='text-grey-20 text-base'>{bio}</p>
      </div>
    )
  }

  const startEditing = () => {
    setDraft(bio)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className='flex flex-col gap-1'>
        <span className='text-grey-40 text-sm'>BIO</span>
        <div className='flex flex-col gap-2'>
          <TextArea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancelEditing()
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey))
                updateBio({ bio: draft })
            }}
            placeholder='Write something about yourself...'
            className='min-h-20 resize-none'
            maxLength={500}
            autoFocus
          />
          <div className='flex gap-2'>
            <UnderlineButton
              size='sm'
              onClick={() => updateBio({ bio: draft })}
            >
              Save
            </UnderlineButton>
            <button
              className='btn-sm text-grey-40 hover:text-grey-20 transition-base'
              onClick={cancelEditing}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-start gap-1'>
      <span className='text-grey-40 text-sm'>BIO</span>
      {bio ? (
        <div className='flex flex-col items-start gap-2'>
          <p className='text-grey-20 text-base'>{bio}</p>
          <UnderlineButton size='sm' onClick={startEditing}>
            Edit Bio
          </UnderlineButton>
        </div>
      ) : (
        <UnderlineButton size='sm' onClick={startEditing}>
          Add Bio
        </UnderlineButton>
      )}
    </div>
  )
}
