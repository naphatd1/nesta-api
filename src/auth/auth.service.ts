import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenDto,
} from "./dto/auth.dto";
import { UserRole } from "@prisma/client";
import * as argon2 from "argon2";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("อีเมลนี้ถูกใช้งานแล้ว กรุณาลองใช้อีเมลอื่นหรือเข้าสู่ระบบหากคุณมีบัญชีอยู่แล้ว");
    }

    // Hash password with Argon2
    const hashedPassword = await argon2.hash(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || UserRole.USER,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Save refresh token to database
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("ไม่พบบัญชีผู้ใช้งานที่ตรงกับอีเมลนี้ กรุณาตรวจสอบอีเมลอีกครั้งหรือสมัครสมาชิกใหม่");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอความช่วยเหลือ");
    }

    // Verify password with Argon2
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านและลองใหม่อีกครั้ง");
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Save refresh token to database
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("User not found or inactive");
    }

    return user;
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenDto
  ): Promise<AuthResponseDto> {
    const { refresh_token } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refresh_token, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      });

      // Find user and check if refresh token matches
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive || !user.refreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Verify stored refresh token
      const isRefreshTokenValid = await argon2.verify(
        user.refreshToken,
        refresh_token
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role);

      // Update refresh token in database
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    // Remove refresh token from database
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: "Logged out successfully" };
  }

  async logoutAll(): Promise<{ message: string }> {
    // Remove all refresh tokens from database (global logout)
    await this.prisma.user.updateMany({
      data: { refreshToken: null },
    });

    return { message: "All users logged out successfully" };
  }

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "15m",
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d",
      }),
    ]);

    // Calculate expiration time in seconds
    const expiresIn = this.parseExpirationTime(
      process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "15m"
    );

    return {
      access_token,
      refresh_token,
      expires_in: expiresIn,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  private parseExpirationTime(timeString: string): number {
    const unit = timeString.slice(-1);
    const value = parseInt(timeString.slice(0, -1));

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 24 * 60 * 60;
      default:
        return 900; // 15 minutes default
    }
  }

  async createAdmin(email: string, password: string, name?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("อีเมลนี้ถูกใช้งานแล้ว ไม่สามารถสร้างผู้ดูแลระบบได้");
    }

    const hashedPassword = await argon2.hash(password);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.ADMIN,
      },
    });
  }
}
