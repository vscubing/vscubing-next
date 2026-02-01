import type { AlgNode } from '@vscubing/cubing/alg'

export function isRotation(node: AlgNode): boolean {
  return ['x', 'y', 'z'].includes(node.toString()[0]!)
}
