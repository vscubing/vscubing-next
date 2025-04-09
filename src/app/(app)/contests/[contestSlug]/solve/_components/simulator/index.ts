import { use } from 'react'
import { SimulatorContext } from './components/simulator-provider'

export { SimulatorProvider } from './components/simulator-provider'
export function useSimulator() {
  return use(SimulatorContext)
}
