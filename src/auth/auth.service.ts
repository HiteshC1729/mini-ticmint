import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser =
      await this.userRepository.findOne({
        where: {
          email: dto.email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Email already registered',
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      10,
    );

    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
    });

    const savedUser =
      await this.userRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
  }

  async login(dto: LoginDto) {
    const user =
      await this.userRepository.findOne({
        where: {
          email: dto.email,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token:
        await this.jwtService.signAsync(payload),
    };
  }
}
