import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

import { CourseService } from '../course/course.service';
import { CreateContentDto, UpdateContentDto } from './content.dto';
import { Content } from './content.entity';
import { ContentQuery } from './content.query';

type PaginatedContents = {
  data: Content[];
  total: number;
  page: number;
  limit: number;
};

@Injectable()
export class ContentService {
  constructor(private readonly courseService: CourseService) {}

  async save(
    courseId: string,
    createContentDto: CreateContentDto,
  ): Promise<Content> {
    const { name, description } = createContentDto;
    const course = await this.courseService.findById(courseId);

    return await Content.create({
      name,
      description,
      course,
      dateCreated: new Date(),
    }).save();
  }

  async findAll(query: ContentQuery): Promise<PaginatedContents> {
    return this.findWithFilters({}, query);
  }

  async findById(id: string): Promise<Content> {
    const content = await Content.findOne(id);

    if (!content) {
      throw new HttpException(
        `Could not find content with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return content;
  }

  async findByCourseIdAndId(courseId: string, id: string): Promise<Content> {
    const content = await Content.findOne({ where: { courseId, id } });

    if (!content) {
      throw new HttpException(
        `Could not find content with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return content;
  }

  async findAllByCourseId(
    courseId: string,
    query: ContentQuery,
  ): Promise<PaginatedContents> {
    return this.findWithFilters({ courseId }, query);
  }

  async update(
    courseId: string,
    id: string,
    updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    const content = await this.findByCourseIdAndId(courseId, id);
    return await Content.create({ id: content.id, ...updateContentDto }).save();
  }

  async delete(courseId: string, id: string): Promise<string> {
    const content = await this.findByCourseIdAndId(courseId, id);
    await Content.delete(content);
    return id;
  }

  async count(): Promise<number> {
    return await Content.count();
  }

  private async findWithFilters(
    baseWhere: Partial<Record<'courseId', string>>,
    query: ContentQuery,
  ): Promise<PaginatedContents> {
    const {
      name,
      description,
      page = 1,
      limit = 10,
      sortBy = 'dateCreated',
      sortOrder = 'DESC',
    } = query;

    const where: any = { ...baseWhere };

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    if (description) {
      where.description = ILike(`%${description}%`);
    }

    const [data, total] = await Content.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }
}
