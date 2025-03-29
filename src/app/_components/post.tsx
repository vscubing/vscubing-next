'use client'

import { useState } from 'react'

import { useTRPC } from '@/trpc/react'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'

export function LatestPost() {
  const trpc = useTRPC()
  const { data: latestPost } = useSuspenseQuery(
    trpc.post.getLatest.queryOptions(),
  )
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const createPost = useMutation(
    trpc.post.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.post.getLatest.queryFilter())
        setName('')
      },
    }),
  )

  return (
    <div className='w-full max-w-xs'>
      {latestPost ? (
        <p className='truncate'>Your most recent post: {latestPost?.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          createPost.mutate({ name })
        }}
        className='flex flex-col gap-2'
      >
        <input
          type='text'
          placeholder='Title'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='bg-white/10 text-white w-full rounded-full px-4 py-2 text-black-80'
        />
        <button
          type='submit'
          className='bg-white/10 hover:bg-white/20 rounded-full px-10 py-3 font-semibold transition'
          disabled={createPost.isPending}
        >
          {createPost.isPending ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
