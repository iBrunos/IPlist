import { IsString, IsBoolean } from 'class-validator';

export class UpdateDto {
  @IsString()
  readonly ip: string;

  @IsString()
  readonly description: string;
  
  @IsBoolean()
  readonly isActive: boolean;
  
  @IsString()
  readonly createdAt: string;

  @IsString()
  readonly updatedAt: string;
}