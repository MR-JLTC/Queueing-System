import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { EmailOtp } from '../../email-otp/entities/email-otp.entity';
import { StaffWindowAssignment } from '../../staff-window-assignments/entities/staff-window-assignment.entity';
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

  @Column({ unique: true, length: 255 })
  username: string;

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

  @OneToMany(() => EmailOtp, emailOtp => emailOtp.user)
  emailOtps: EmailOtp[];

  @OneToMany(() => StaffWindowAssignment, assignment => assignment.staff)
  staffAssignments: StaffWindowAssignment[];

  @OneToMany(() => QueueTicket, ticket => ticket.cancelledBy)
  cancelledTickets: QueueTicket[];

  @OneToMany(() => TicketStatusHistory, history => history.changedBy)
  ticketStatusHistories: TicketStatusHistory[];
}
