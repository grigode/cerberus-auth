export class PaginatedHttpResponsePresenter {
  static present<T extends { toPrimitives(): unknown }>(data: {
    count: number;
    pages: number;
    limit: number;
    items: T[];
  }) {
    return {
      info: {
        count: data.count,
        pages: data.pages,
        limit: data.limit,
      },
      result: data.items.map((item) => item.toPrimitives()),
    };
  }
}
