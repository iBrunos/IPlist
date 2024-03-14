import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './schemas/user.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Query } from 'express-serve-static-core';
import { CreateUsersDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) { }


  async findAll(query: Query): Promise<User[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const keyword = query.keyword
      ? {
        name: {
          $regex: query.keyword,
          $options: 'i',
        },
      }
      : {};
    const users = await this.userModel
      .find({ ...keyword })
      //.limit(resPerPage)
      .skip(skip);
    return users;
  }

  async create(createDto: CreateUsersDto): Promise<{ message: string; createdUser: User }> {
    const {
      name,
      email,
      password, // Adicionando password aqui
    } = createDto;

    try {
      // Hash da senha antes de salvar no banco de dados
      const hashedPassword = await this.hashPassword(password);

      const createdUser = await this.userModel.create({
        name,
        email,
        password: hashedPassword, // Incluindo a senha hash no documento
      });

      return { message: 'User created successfully', createdUser };
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new Error('Failed to create user');
    }
  }


  async findById(id: Types.ObjectId): Promise<User> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Please enter a valid ID.');
    }
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  async updateById(id: mongoose.Types.ObjectId, user: User): Promise<{ message: string, updatedUser: User | null }> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, user, {
        new: true,
        runValidators: true,
      });
      if (!updatedUser) {
        throw new Error('User not found');
      }
      return { message: 'User updated successfully', updatedUser };
    } catch (error) {
      throw new Error('Failed to update user'); // Personalize a mensagem de erro conforme necessário
    }
  }

  async deleteById(id: mongoose.Types.ObjectId): Promise<{ message: string, deletedUser: User | null }> {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new Error('User not found');
      }
      return { message: 'User deleted successfully', deletedUser };
    } catch (error) {
      throw new Error('Failed to delete user'); // Personalize a mensagem de erro conforme necessário
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("hashedPassword: ",hashedPassword)
      return hashedPassword;
    } catch (error) {
      console.error('Erro ao gerar hash de senha:', error);
      throw error; // Rejeita o erro para ser tratado por quem chamou esta função
    }
  }
  async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ name: username });
      return user;
    } catch (error) {
      console.error('Failed to find user by username:', error);
      throw new Error('Failed to find user by username');
    }
  }

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.findByUsername(username);

      if (!user) {
        console.log("Usuário não encontrado");
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      } else {
        console.log('Senha incorreta');
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error) {
      console.error("Erro na função validateUser:", error);
      throw error;
    }
  }


}