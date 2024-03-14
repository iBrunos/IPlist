import { IsString, IsBoolean } from 'class-validator';

export class CreateDto {
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