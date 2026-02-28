import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { basename, extname, join } from 'path';
import { ILike } from 'typeorm';

import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { Course } from './course.entity';
import { CourseQuery } from './course.query';

type CourseImageFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class CourseService {
  async save(
    createCourseDto: CreateCourseDto,
    image?: CourseImageFile,
  ): Promise<Course> {
    const imageUrl = image ? await this.storeCourseImage(image) : null;

    return await Course.create({
      name: createCourseDto.name,
      description: createCourseDto.description,
      imageUrl,
      dateCreated: new Date(),
    }).save();
  }

  async findAll(
    query: CourseQuery,
  ): Promise<{ data: Course[]; total: number; page: number; limit: number }> {
    const {
      name,
      description,
      page = 1,
      limit = 10,
      sortBy = 'dateCreated',
      sortOrder = 'DESC',
    } = query;

    const where: any = {};

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    if (description) {
      where.description = ILike(`%${description}%`);
    }

    const [data, total] = await Course.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Course> {
    const course = await Course.findOne(id);

    if (!course) {
      throw new HttpException(
        `Could not find course with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    image?: CourseImageFile,
  ): Promise<Course> {
    const course = await this.findById(id);

    let nextImageUrl: string | null = course.imageUrl ?? null;

    if (image) {
      await this.deleteCourseImage(course.imageUrl);
      nextImageUrl = await this.storeCourseImage(image);
    } else if (updateCourseDto.removeImage) {
      await this.deleteCourseImage(course.imageUrl);
      nextImageUrl = null;
    }

    return await Course.create({
      id: course.id,
      name: updateCourseDto.name ?? course.name,
      description: updateCourseDto.description ?? course.description,
      imageUrl: nextImageUrl,
    }).save();
  }

  async delete(id: string): Promise<string> {
    const course = await this.findById(id);

    await this.deleteCourseImage(course.imageUrl);
    await Course.delete(course);

    return id;
  }

  async count(): Promise<number> {
    return await Course.count();
  }

  private async storeCourseImage(file: CourseImageFile): Promise<string> {
    this.validateCourseImage(file);

    const uploadsDir = this.getCourseUploadsDir();
    await mkdir(uploadsDir, { recursive: true });

    const imageExtension = this.resolveImageExtension(file);
    const filename = `${Date.now()}-${randomUUID()}${imageExtension}`;
    const absolutePath = join(uploadsDir, filename);

    await writeFile(absolutePath, file.buffer);

    return `/api/uploads/courses/${filename}`;
  }

  private async deleteCourseImage(imageUrl?: string): Promise<void> {
    if (!imageUrl) {
      return;
    }

    const cleanImageUrl = imageUrl.split('?')[0];
    const filename = basename(cleanImageUrl);

    if (!filename) {
      return;
    }

    const absolutePath = join(this.getCourseUploadsDir(), filename);

    try {
      await unlink(absolutePath);
    } catch (error) {
      // Ignore file-not-found and continue with business flow.
    }
  }

  private validateCourseImage(file: CourseImageFile): void {
    if (!file?.buffer) {
      throw new HttpException(
        'Course image file is invalid',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new HttpException(
        'Only JPG, PNG and WEBP images are allowed',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new HttpException(
        'Course image must be 5MB or less',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private resolveImageExtension(file: CourseImageFile): string {
    if (file.mimetype === 'image/jpeg') {
      return '.jpg';
    }

    if (file.mimetype === 'image/png') {
      return '.png';
    }

    if (file.mimetype === 'image/webp') {
      return '.webp';
    }

    const extension = extname(file.originalname).toLowerCase();

    return extension || '.jpg';
  }

  private getCourseUploadsDir(): string {
    return join(process.cwd(), 'uploads', 'courses');
  }
}
