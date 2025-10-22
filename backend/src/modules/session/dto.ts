import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  provider?: 'OPENAI' | 'GOOGLE' | 'ANTHROPIC';
}

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsString()
  @IsOptional()
  groupId?: string | null;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  provider?: 'OPENAI' | 'GOOGLE' | 'ANTHROPIC';
}
