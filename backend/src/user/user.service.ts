import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ILike } from 'typeorm';

import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { UserQuery } from './user.query';

@Injectable()
export class UserService {
  async save(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findByUsername(createUserDto.username);

    if (user) {
      throw new HttpException(
        `User with username ${createUserDto.username} is already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { password } = createUserDto;
    createUserDto.password = await bcrypt.hash(password, 10);
    return User.create(createUserDto).save();
  }

  async findAll(
    query: UserQuery,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const {
      firstName,
      lastName,
      username,
      role,
      page = 1,
      limit = 10,
      sortBy = 'dateCreated',
      sortOrder = 'DESC',
    } = query;

    const where: any = {};

    if (firstName) {
      where.firstName = ILike(`%${firstName}%`);
    }

    if (lastName) {
      where.lastName = ILike(`%${lastName}%`);
    }

    if (username) {
      where.username = ILike(`%${username}%`);
    }

    if (role) {
      where.role = role;
    }

    const [data, total] = await User.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<User> {
    const user = await User.findOne(id);

    if (!user) {
      throw new HttpException(
        `Could not find user with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return User.findOne({ where: { username } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const currentUser = await this.findById(id);

    if (currentUser.username === updateUserDto.username) {
      delete updateUserDto.username;
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.username) {
      if (await this.findByUsername(updateUserDto.username)) {
        throw new HttpException(
          `User with username ${updateUserDto.username} is already exists`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return User.create({ id, ...updateUserDto }).save();
  }

  async delete(id: string): Promise<string> {
    await User.delete(await this.findById(id));
    return id;
  }

  async count(): Promise<number> {
    return await User.count();
  }

  async setRefreshToken(id: string, refreshToken: string): Promise<void> {
    const user = await this.findById(id);
    await User.update(user, {
      refreshToken: refreshToken ? await bcrypt.hash(refreshToken, 10) : null,
    });
  }
}
