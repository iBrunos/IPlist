import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schemas';
import { CreateUsersDto } from './dto/create-user.dto';
import { UpdateUsersDto } from './dto/update-user.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import * as jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  async getAllServices(@Query() query: ExpressQuery): Promise<User[]> {
    return this.usersService.findAll(query);
  }

  @Post('/create')
  async create(@Body() createDto: CreateUsersDto): Promise<{ message: string }> {

    // Agora, crie o funcionário
    return this.usersService.create(createDto);
  }
  @Post('/login')
  async login(@Body() loginDto: { username: string; password: string }): Promise<any> {
    try {

      const user = await this.usersService.validateUser(loginDto.username, loginDto.password);
   
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.generateJwtToken(user);

      return { message: 'Login successful', token , user};
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private generateJwtToken(user: any): string {
    const payload = { username: user.username, sub: user.id };
    const secretKey = 'yourSecretKey'; // Substitua pelo sua chave secreta

    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Defina a expiração como desejado

    return token;
  }
  @Get('/:id')
  async getUsers(@Param('id') id: mongoose.Types.ObjectId) {
    const user = await this.usersService.findById(id);
    return user;
  }

  @Put('/:id')
  async updateUsers(
    @Param('id') id: mongoose.Types.ObjectId,
    @Body() user: UpdateUsersDto,
  ): Promise<{ message: string }> {
    // Se a senha estiver presente, hash antes de atualizar
    if (user.password) {
      user.password = await this.usersService.hashPassword(user.password);
    }

    return this.usersService.updateById(id, user);
  }

  @Delete('/:id')
  async deleteUsers(@Param('id') id: mongoose.Types.ObjectId) {
    const user = await this.usersService.deleteById(id);
    return user;
  }
}