import { IsString, IsEmail, IsBoolean, IsInt, MinLength, MaxLength, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  fullName: string; // Required for generic users

  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty() // Email is required for generic users
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @IsNotEmpty() // Password is required for generic users
  password: string;

  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @IsOptional() // branchId is optional for users (e.g., SuperAdmin might not have one, or it's set by context)
  @IsInt()
  branchId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(VisibilityStatus)
  visibilityStatus?: VisibilityStatus;
}
