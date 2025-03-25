"use client";

import { ListWrapper, ListWithPinnedItem, List } from "./List";
import { ListSkeleton } from "./ListSkeleton";
import { useFittingCount } from "./useAutofillHeight";
// import { useInfiniteScroll } from './useInfiniteScroll'

export type Behavior = "infinite-scroll" | "pagination";
export type {
  ListWrapperProps,
  ListProps,
  ListWithPinnedItemProps,
} from "./List";

export const AutofillHeight = {
  ListWrapper,
  List,
  ListSkeleton,
  ListWithPinnedItem,
  useFittingCount,
  // useInfiniteScroll,
};
