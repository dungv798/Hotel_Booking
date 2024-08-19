import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signUp(@Body('email') email: string, @Body('password') password: string) {
    const user = await this.userService.createUser(email, password);
    return { message: 'User registered successfully', userId: user.id };
  }
}
