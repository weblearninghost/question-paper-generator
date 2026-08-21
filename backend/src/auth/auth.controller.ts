import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BootstrapDto } from './dto/bootstrap.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //   @Post('register')
  //   register(@Body() registerDto: RegisterDto) {
  //     return this.authService.register(registerDto);
  //   }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request) {
    return req.user;
  }
  @Post('bootstrap')
  bootstrap(@Body() bootstrapDto: BootstrapDto) {
    return this.authService.bootstrapSuperAdmin(bootstrapDto);
  }
}
