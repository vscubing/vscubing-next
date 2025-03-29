export function groupBy<I, K>(
  iterable: Iterable<I>,
  keyExtractor: (item: I) => K,
) {
  return [...iterable].reduce((map, item) => {
    const key = keyExtractor(item)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
    return map
  }, new Map<K, I[]>())
}
