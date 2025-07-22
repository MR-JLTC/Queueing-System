import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailOtpDto } from './create-email-otp.dto';

export class UpdateEmailOtpDto extends PartialType(CreateEmailOtpDto) {}
