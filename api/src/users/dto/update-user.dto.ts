import { IsBoolean, IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

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
}