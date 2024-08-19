import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  async signIn(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.signIn(authCredentialsDto.email, authCredentialsDto.password);
  }

  @Post('signup')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  async signUp(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.signUp(authCredentialsDto.email, authCredentialsDto.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This route will redirect to Google login page
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const { user } = req;
    const tokens = await this.authService.googleLogin(user);  // Sử dụng `await` để chờ xử lý Promise
    res.cookie('access_token', tokens.accessToken, { httpOnly: true });
    res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true });
    return res.redirect('/'); // Redirect to the homepage or dashboard after successful login
  }
}
