import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    
    // Debugging: Kiểm tra người dùng
    console.log('User found:', user);

    if (user && await bcrypt.compare(password, user.password)) {
      // Debugging: Kiểm tra xem mật khẩu có khớp không
      console.log('Password matched');
      return this.generateTokens(user);
    }

    console.log('Invalid credentials'); // Debugging: Mật khẩu hoặc email không đúng
    throw new UnauthorizedException('Invalid credentials');
  }

  async signUp(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userService.createUser(email, hashedPassword);
    return { message: 'User registered successfully', userId: newUser.id };
  }

  generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async googleLogin(user: any) {
    const existingUser = await this.userService.findByEmail(user.email);
    if (!existingUser) {
      await this.userService.createUser(user.email, null); // Tạo người dùng mới nếu chưa tồn tại
    }
    return this.generateTokens(user);
  }
}
