'use client'

import { Input, PrimaryButton } from '@/app/_components/ui'
import { validateSolveAction, type Solve } from '../actions'
import { useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
import { removeSolutionComments } from '@/app/_utils/remove-solution-comments'
import type { Discipline } from '@/app/_types'

export function SolveValidator() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Solve>()
  const [removeComments, setRemoveComments] = useState(false)
  const [isPending, startTransition] = useTransition()

  function onSubmit({ solution, scramble, discipline }: Solve) {
    startTransition(async () => {
      if (removeComments) solution = removeSolutionComments(solution)
      const res = await validateSolveAction({
        discipline: discipline.trim() as Discipline,
        scramble: scramble.trim(),
        solution: solution.trim(),
      })
      const message = `Sent scramble ${scramble} and solution ${solution}. Result: ${res}`
      setError('root', { message })
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2'>
      <h2 className='title-h2'>Solve validator</h2>
      <Input placeholder='Scramble' required {...register('scramble')} />
      <Input placeholder='Solution' required {...register('solution')} />
      <Input
        placeholder='Discipline'
        value='3by3'
        {...register('discipline')}
      />
      <label>
        <input
          type='checkbox'
          checked={removeComments}
          onChange={(e) => setRemoveComments(e.target.checked)}
        />
        Remove comments
      </label>
      <PrimaryButton disabled={isPending} type='submit' size='sm'>
        Submit
      </PrimaryButton>
      {errors.root && `result: ${errors.root?.message}`}
    </form>
  )
}
