import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Adjust path if necessary

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn({ name: 'branch_id' })
  branchId: number;

  @Column({ name: 'branch_name', unique: true, length: 255 })
  branchName: string; // Maps to 'branch_name' column

  @Column({ name: 'branch_location', length: 255, nullable: true })
  branchLocation: string; // Maps to 'branch_location' column

  @Column({ name: 'contact_number', length: 50, nullable: true }) // Assuming contact number is a string
  contactNumber: string; // Maps to 'contact_number' column

  @Column({ name: 'visibility_status', length: 255, comment: 'ON_LIVE or ON_DELETE' })
  visibilityStatus: string; // Maps to 'visibility_status' column (assuming string or an enum like in User)

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date; // Maps to 'createdAt' timestamp column

  @OneToMany(() => User, (user) => user.branch)
  users: User[];
}