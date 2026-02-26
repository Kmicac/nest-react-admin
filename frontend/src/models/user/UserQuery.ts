export default interface UserQuery {
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  page?: number;
  limit?: number;
  sortBy?:
    | 'dateCreated'
    | 'firstName'
    | 'lastName'
    | 'username'
    | 'role'
    | 'isActive';
  sortOrder?: 'ASC' | 'DESC';
}
