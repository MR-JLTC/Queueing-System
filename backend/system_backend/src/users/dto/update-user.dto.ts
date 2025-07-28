import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsEmail, MaxLength, MinLength, IsBoolean, IsEnum, IsInt } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Explicitly redefine optional fields if PartialType doesn't handle them as desired
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password?: string;

  @IsOptional()
  @IsInt()
  roleId?: number; // Allow updating roleId

  @IsOptional()
  @IsInt()
  branchId?: number; // Allow updating branchId

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(VisibilityStatus)
  visibilityStatus?: VisibilityStatus;
}
