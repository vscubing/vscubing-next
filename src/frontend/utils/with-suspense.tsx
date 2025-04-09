import { type ComponentType, type SuspenseProps, Suspense } from 'react'

/**
 * Wraps the provide component in a `Suspense`, with the provided fallback.
 * This should be used on components whose parent is not easy to control, such as
 * React Navigation screens to be able to lazy load them using `React.lazy`.
 * @param WrappedComponent The component to wrap.
 * @param fallback The component to render while loading.
 *
 * @example
 * const SomeScreen = withSuspense(React.lazy(() => import("path/to/some/screen")));
 */
export function withSuspense<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback: SuspenseProps['fallback'] = null,
) {
  function ComponentWithSuspense(props: P) {
    return (
      <Suspense fallback={fallback}>
        <WrappedComponent {...props} />
      </Suspense>
    )
  }

  return ComponentWithSuspense
}
