import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post', description: 'Post title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'This is the content of my post...', description: 'Post content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the post is published' })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Updated Post Title', description: 'Post title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated content...', description: 'Post content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether the post is published' })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}