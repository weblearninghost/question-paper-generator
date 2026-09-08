import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassOwnerDto } from './dto/create-class-owner.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createClassOwner(dto: CreateClassOwnerDto) {
    const { name, email, password, tuitionName } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      // Create Class Owner
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'CLASS_OWNER',
        },
      });

      // Create Tuition for the Class Owner
      const tuition = await tx.tuition.create({
        data: {
          name: tuitionName,
          ownerId: user.id,
        },
      });

      return {
        user,
        tuition,
      };
    });

    return {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      isActive: result.user.isActive,

      tuition: {
        id: result.tuition.id,
        name: result.tuition.name,
      },
    };
  }
}
