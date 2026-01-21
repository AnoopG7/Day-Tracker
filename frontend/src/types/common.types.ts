/** Common TypeScript types used across the application */

import type { ReactElement, ReactNode } from 'react';

/** Base component props with children */
export interface WithChildren {
  children: ReactNode;
}

/** Component with optional className */
export interface WithClassName {
  className?: string;
}

/** Base props for page components */
export interface PageProps extends WithClassName {
  title?: string;
}

/** Generic async function type */
export type AsyncFunction<T = void> = () => Promise<T>;

/** Generic callback function */
export type Callback<T = void> = () => T;

/** ID type (string for most use cases) */
export type ID = string;

/** Timestamp as ISO string */
export type ISOTimestamp = string;

/** Nullable type helper */
export type Nullable<T> = T | null;

/** Optional type helper */
export type Optional<T> = T | undefined;

/** Component that returns ReactElement */
export type FC<P = object> = (props: P) => ReactElement;

/** Loading state interface */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/** Pagination params */
export interface PaginationParams {
  page: number;
  limit: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Sort params */
export interface SortParams {
  field: string;
  direction: SortDirection;
}
