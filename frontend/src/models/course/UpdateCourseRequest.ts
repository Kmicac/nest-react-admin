export default interface UpdateCourseRequest {
  name?: string;
  description?: string;
  image?: File | null;
  removeImage?: boolean;
}
