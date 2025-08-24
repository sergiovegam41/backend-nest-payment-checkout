import { IsOptional, IsInt, Min, Max, IsIn, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CursorPaginationQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 10;

  @IsOptional()
  @IsIn(['forward', 'backward'])
  direction?: 'forward' | 'backward' = 'forward';
}