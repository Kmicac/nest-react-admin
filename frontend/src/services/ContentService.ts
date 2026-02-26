import Content from '../models/content/Content';
import ContentQuery from '../models/content/ContentQuery';
import CreateContentRequest from '../models/content/CreateContentRequest';
import UpdateContentRequest from '../models/content/UpdateContentRequest';
import apiService from './ApiService';
import { PaginatedResponse } from './UserService';

class ContentService {
  async findAll(
    courseId: string,
    contentQuery: ContentQuery,
  ): Promise<PaginatedResponse<Content>> {
    const response = await apiService.get<
      Content[] | PaginatedResponse<Content>
    >(`/api/courses/${courseId}/contents`, {
      params: contentQuery,
    });

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

  async save(
    courseId: string,
    createContentRequest: CreateContentRequest,
  ): Promise<void> {
    await apiService.post(
      `/api/courses/${courseId}/contents`,
      createContentRequest,
    );
  }

  async update(
    courseId: string,
    id: string,
    updateContentRequest: UpdateContentRequest,
  ): Promise<void> {
    await apiService.put(
      `/api/courses/${courseId}/contents/${id}`,
      updateContentRequest,
    );
  }

  async delete(courseId: string, id: string): Promise<void> {
    await apiService.delete(`/api/courses/${courseId}/contents/${id}`);
  }
}

export default new ContentService();
