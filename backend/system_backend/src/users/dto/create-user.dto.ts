import { IsString, IsEmail, IsBoolean, IsInt, MinLength, MaxLength, IsEnum } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

export class CreateUserDto {
  @IsInt()
  roleId: number;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  fullName: string;

  // REMOVE THIS BLOCK FOR USERNAME
  // @IsString()
  // @MinLength(3)
  // @MaxLength(255)
  // username: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8) // Example: enforce minimum password length
  @MaxLength(255)
  password: string; // This will be hashed in the service

  @IsBoolean()
  isActive: boolean;

  @IsEnum(VisibilityStatus)
  visibilityStatus: VisibilityStatus;

  @IsInt() // Assuming branchId is still required
  branchId: number;
}