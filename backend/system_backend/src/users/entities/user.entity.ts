import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { EmailOtp } from '../../email-otp/entities/email-otp.entity';
import { StaffWindowAssignment } from '../../staff-window-assignments/entities/staff-window-assignment.entity'; // <--- IMPORT StaffWindowAssignment
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity';
import { TicketStatusHistory } from '../../ticket-status-history/entities/ticket-status-history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  // Assuming 'username' was removed as per snippet context in previous turns, or keep if it still exists
  // @Column({ unique: true, length: 255 })
  // username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'visibility_status', length: 255, comment: 'ON_LIVE or ON_DELETE' })
  visibilityStatus: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'branch_id', nullable: true })
  branchId: number;

  @ManyToOne(() => Branch, (branch) => branch.users)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToMany(() => EmailOtp, emailOtp => emailOtp.user)
  emailOtps: EmailOtp[];

  @OneToMany(() => StaffWindowAssignment, assignment => assignment.staff) // <--- ADDED: Staff assignments for this user
  staffAssignments: StaffWindowAssignment[]; // This resolves the error: Property 'staffAssignments' does not exist on type 'User'.

  @OneToMany(() => QueueTicket, ticket => ticket.assignedToStaff)
  staffAssignedTickets: QueueTicket[];

  @OneToMany(() => QueueTicket, ticket => ticket.cancelledBy)
  cancelledTickets: QueueTicket[];

  @OneToMany(() => TicketStatusHistory, history => history.changedBy)
  ticketStatusHistories: TicketStatusHistory[];
}