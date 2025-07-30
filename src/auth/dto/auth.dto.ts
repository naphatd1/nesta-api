import { IsEmail, IsString, MinLength, IsOptional, IsEnum, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com' })
  email: string;

  @ApiProperty({ 
    example: 'Password123!', 
    description: 'User password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)' 
  })
  @IsString({ message: 'กรุณากรอกรหัสผ่าน' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'รหัสผ่านต้องประกอบด้วย ตัวอักษรพิมพ์เล็ก (a-z) ตัวอักษรพิมพ์ใหญ่ (A-Z) ตัวเลข (0-9) และอักขระพิเศษ (@$!%*?&)'
  })
  password: string;

  @ApiPropertyOptional({ example: 'สมชาย ใจดี', description: 'User full name' })
  @IsOptional()
  @IsString({ message: 'กรุณากรอกชื่อเป็นตัวอักษร' })
  @MinLength(2, { message: 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร' })
  name?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'User role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'User password' })
  @IsString({ message: 'กรุณากรอกรหัสผ่านของคุณ' })
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT refresh token' })
  refresh_token: string;

  @ApiProperty({ example: 3600, description: 'Token expiration time in seconds' })
  expires_in: number;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-string',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'USER'
    }
  })
  user: {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
  };
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT refresh token' })
  @IsString()
  refresh_token: string;
}