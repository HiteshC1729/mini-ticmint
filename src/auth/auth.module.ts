import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),

    PassportModule,

    JwtModule.register({
      secret: 'mini-ticmint-secret',
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
  ],

  exports: [
    AuthService,
    RolesGuard,
  ],
})
export class AuthModule {}
