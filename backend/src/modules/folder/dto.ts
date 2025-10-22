import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  name?: string;
}
