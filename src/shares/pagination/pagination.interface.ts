export interface IPaginationMetadata {
  page: number;
  total_count: number;
  pages_count: number;
  per_page: number;
  next_page: number;
}

export interface IPagination {
  page: number;
  perPage: number;
  startIndex?: number;
  endIndex?: number;
}

export interface IPaginationResponse<T> {
  items: T[];
  metadata: IPaginationMetadata;
}
