import Course from '../models/course/Course';
import CourseQuery from '../models/course/CourseQuery';
import CreateCourseRequest from '../models/course/CreateCourseRequest';
import UpdateCourseRequest from '../models/course/UpdateCourseRequest';
import apiService from './ApiService';
import { PaginatedResponse } from './UserService';

class UserService {
  async save(createCourseRequest: CreateCourseRequest): Promise<void> {
    await apiService.post('/api/courses', createCourseRequest);
  }

  async findAll(courseQuery: CourseQuery): Promise<PaginatedResponse<Course>> {
    const response = await apiService.get<Course[] | PaginatedResponse<Course>>(
      '/api/courses',
      { params: courseQuery },
    );

    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.data.length,
      };
    }

    return {
      data: response.data?.data ?? [],
      total: response.data?.total ?? 0,
      page: response.data?.page,
      limit: response.data?.limit,
    };
  }

  async findOne(id: string): Promise<Course> {
    return (await apiService.get<Course>(`/api/courses/${id}`)).data;
  }

  async update(
    id: string,
    updateCourseRequest: UpdateCourseRequest,
  ): Promise<void> {
    await apiService.put(`/api/courses/${id}`, updateCourseRequest);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/api/courses/${id}`);
  }
}

export default new UserService();
