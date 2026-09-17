import { Body, Controller, Post, UseGuards, Get, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { UsersService } from './users.service';
import { CreateClassOwnerDto } from './dto/create-class-owner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('class-owners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  createClassOwner(@Body() dto: CreateClassOwnerDto) {
    return this.usersService.createClassOwner(dto);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return this.usersService.getMe(req.user.id);
  }
}
