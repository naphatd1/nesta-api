import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'สมชาย ใจดี', description: 'User full name' })
  @IsOptional()
  @IsString({ message: 'กรุณากรอกชื่อเป็นตัวอักษร' })
  @MinLength(2, { message: 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร' })
  name?: string;

  @ApiPropertyOptional({ example: 'user@example.com', description: 'User email address' })
  @IsOptional()
  @IsEmail({}, { message: 'กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com' })
  email?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'User role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: true, description: 'User active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'User password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)' })
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