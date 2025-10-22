import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content!: string;
}
