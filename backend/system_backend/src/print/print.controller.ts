import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrintService } from './print.service';

@Controller('print-ticket')
export class PrintController {
  constructor(private readonly printService: PrintService) {}

  @Post()
  @UseInterceptors(FileInterceptor('pdf')) // 'pdf' is the field name from FormData
  async printTicket(@UploadedFile() file: Express.Multer.File) {
    if (!file || file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Invalid file upload. Only PDF files are allowed.');
    }
    // file.buffer contains the PDF data as a Buffer
    // You might also want to pass ticketNumber or other metadata if needed
    try {
      await this.printService.printPdf(file.buffer);
      return { message: 'Print job sent successfully!' };
    } catch (error) {
      console.error('Error in printTicket controller:', error);
      throw new BadRequestException('Failed to send print job.');
    }
  }
}