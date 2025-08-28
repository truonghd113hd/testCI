import { Injectable } from '@nestjs/common';
import { IPagination, IPaginationMetadata } from './pagination.interface';

@Injectable()
export class PaginationMetadataHelper {
  public getMetadata(pagination: IPagination, totalCount: number): IPaginationMetadata {
    if (!pagination) {
      return;
    }

    const page = +pagination.page;
    const perPage = +pagination.perPage;
    const pagesCount = Math.ceil(totalCount / perPage);

    return {
      page,
      total_count: totalCount,
      pages_count: pagesCount,
      per_page: perPage,
      next_page: page === pagesCount ? page : page + 1,
    };
  }
}

export const createPagination = (page: number, perPage: number): IPagination => {
  page = +page || 1;
  perPage = +perPage || 20;

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;

  return {
    page,
    perPage,
    startIndex,
    endIndex,
  };
};
