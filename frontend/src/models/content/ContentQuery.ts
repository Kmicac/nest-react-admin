export default interface ContentQuery {
  name?: string;
  description?: string;
  page?: number;
  limit?: number;
  sortBy?: 'dateCreated' | 'name' | 'description';
  sortOrder?: 'ASC' | 'DESC';
}
