import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

export function useWcaAvatarUrl({ wcaId }: { wcaId: string }) {
  return useQuery({
    queryFn: async () => {
      const res = await fetch(
        `https://www.worldcubeassociation.org/api/v0/persons/${wcaId}`,
      )
      const json = (await res.json()) as unknown
      const parsed = z
        .object({
          person: z.object({ avatar: z.object({ url: z.string().url() }) }),
        })
        .parse(json)

      const avatarUrl = parsed.person.avatar.url
      return avatarUrl.includes('missing_avatar_thumb') ? null : avatarUrl
    },
    queryKey: ['wca-official-api', 'persons', wcaId],
  })
}
