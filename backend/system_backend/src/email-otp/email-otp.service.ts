import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailOtp } from './entities/email-otp.entity';
import { CreateEmailOtpDto } from './dto/create-email-otp.dto';
import { UpdateEmailOtpDto } from './dto/update-email-otp.dto';

@Injectable()
export class EmailOtpService {
  constructor(
    @InjectRepository(EmailOtp)
    private emailOtpRepository: Repository<EmailOtp>,
  ) {}

  create(createEmailOtpDto: CreateEmailOtpDto): Promise<EmailOtp> {
    const emailOtp = this.emailOtpRepository.create(createEmailOtpDto);
    return this.emailOtpRepository.save(emailOtp);
  }

  findAll(): Promise<EmailOtp[]> {
    return this.emailOtpRepository.find();
  }

  async findOne(otpId: number): Promise<EmailOtp> {
    const emailOtp = await this.emailOtpRepository.findOne({ where: { otpId } });
    if (!emailOtp) {
      throw new NotFoundException(`Email OTP with ID "${otpId}" not found`);
    }
    return emailOtp;
  }

  async update(otpId: number, updateEmailOtpDto: UpdateEmailOtpDto): Promise<EmailOtp> {
    const emailOtp = await this.findOne(otpId);
    Object.assign(emailOtp, updateEmailOtpDto);
    return this.emailOtpRepository.save(emailOtp);
  }

  async remove(otpId: number): Promise<void> {
    const result = await this.emailOtpRepository.delete(otpId);
    if (result.affected === 0) {
      throw new NotFoundException(`Email OTP with ID "${otpId}" not found`);
    }
  }
}
