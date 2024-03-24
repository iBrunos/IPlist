import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from './create-user.dto'; 

export class UpdateUsersDto {

  @IsOptional()
  @IsString()
  readonly name: string;
  
  @IsOptional()
  @IsString()
  readonly email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  @IsEnum(UserRole, { message: 'Invalid user role' }) // Garante que o valor seja um dos valores do enum UserRole
  level: string; // Atualizado para ser uma string

  @IsOptional()
  @IsString()
  updatedAt: string;
}
