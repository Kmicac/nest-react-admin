export default interface CreateCourseRequest {
  name: string;
  description: string;
  image?: File | null;
}
