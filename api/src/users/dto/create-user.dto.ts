import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

// Enum para os níveis de permissão
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  USER = 'user',
  READING = 'reading',
}

export class CreateUsersDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
  
  @IsNotEmpty()
  @IsString()
  @IsEnum(UserRole) // Garante que o valor seja um dos valores do enum UserRole
  level: UserRole; // Usa o enum UserRole como tipo para o campo level
}
