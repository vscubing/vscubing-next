import {
  type UseInfiniteQueryOptions,
  type InfiniteData,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { useIntersectionObserver } from "usehooks-ts";

// export function useInfiniteScroll<T extends { pages?: number }>(
//   query: UseInfiniteQueryOptions<
//     T,
//     AxiosError<unknown, unknown>,
//     InfiniteData<T, unknown>,
//     T,
//     // QueryKey is tricky to type correctly and should be type-checked in queryOptions(), so there is no harm in using `any` here
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     any,
//     number
//   >,
// ) {
//   const queryResult = useInfiniteQuery(query);
//   const { data, isFetching, fetchNextPage } = queryResult;
//
//   const pages = data?.pages?.[0].pages;
//   const allPagesLoaded = !!pages && data?.pages?.length === pages;
//
//   const { isIntersecting, ref: lastElementRef } = useIntersectionObserver({
//     rootMargin: "10%",
//   });
//   useEffect(() => {
//     if (isIntersecting && !isFetching && !allPagesLoaded) {
//       void fetchNextPage();
//     }
//   }, [isFetching, isIntersecting, allPagesLoaded, fetchNextPage]);
//
//   return { ...queryResult, lastElementRef };
// }
