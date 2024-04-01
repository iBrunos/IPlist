import { IsString, IsBoolean } from 'class-validator';

export class UpdateDto {
  @IsString()
  ip: string;

  @IsString()
  description: string;
  
  @IsBoolean()
  disabled: boolean;
  
  @IsString()
  readonly createdAt: string;

  @IsString()
  updatedAt: string;
}