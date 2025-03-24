import { ListWrapper, ListWithPinnedItem, List } from "./List";
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
  ListWithPinnedItem,
  useFittingCount,
  // useInfiniteScroll,
};
