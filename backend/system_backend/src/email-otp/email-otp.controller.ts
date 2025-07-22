import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailOtpService } from './email-otp.service';
import { CreateEmailOtpDto } from './dto/create-email-otp.dto';
import { UpdateEmailOtpDto } from './dto/update-email-otp.dto';

@Controller('email-otp')
export class EmailOtpController {
  constructor(private readonly emailOtpService: EmailOtpService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEmailOtpDto: CreateEmailOtpDto) {
    return this.emailOtpService.create(createEmailOtpDto);
  }

  @Get()
  findAll() {
    return this.emailOtpService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailOtpService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmailOtpDto: UpdateEmailOtpDto) {
    return this.emailOtpService.update(+id, updateEmailOtpDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.emailOtpService.remove(+id);
  }
}
