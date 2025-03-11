import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateSpaceDto {
  @IsNotEmpty()
  @IsString()
  position: string;

  @IsNotEmpty()
  @IsInt()
  duration: number;
}
