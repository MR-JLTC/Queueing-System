import { IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum'; // Assuming you have this enum shared

export class CreateBranchDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  branchName: string; // Corresponds to branch_name

  @IsOptional()
  @IsString()
  @MaxLength(255)
  branchLocation?: string; // Corresponds to branch_location

  @IsOptional()
  @IsString()
  @MaxLength(50) // Adjust max length as per your contact number format
  contactNumber?: string; // Corresponds to contact_number

  @IsEnum(VisibilityStatus) // Use IsEnum if VisibilityStatus is an enum
  visibilityStatus: VisibilityStatus; // Corresponds to visibility_status
}