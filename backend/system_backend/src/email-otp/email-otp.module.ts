import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailOtpService } from './email-otp.service';
import { EmailOtpController } from './email-otp.controller';
import { EmailOtp } from './entities/email-otp.entity';
import { User } from '../users/entities/user.entity'; // Import User for relationship

@Module({
  imports: [TypeOrmModule.forFeature([EmailOtp, User])],
  controllers: [EmailOtpController],
  providers: [EmailOtpService],
  exports: [EmailOtpService],
})
export class EmailOtpModule {}