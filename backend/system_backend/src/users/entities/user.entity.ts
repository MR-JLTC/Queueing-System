// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { EmailOtp } from '../../email-otp/entities/email-otp.entity';
import { TicketStatusHistory } from '../../ticket-status-history/entities/ticket-status-history.entity';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity';

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

  // FIXED: Explicitly set type to 'varchar'
  @Column({ unique: true, length: 255, nullable: true, type: 'varchar' })
  email: string | null;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'visibility_status', length: 255, comment: 'ON_LIVE or ON_DELETE' })
  visibilityStatus: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // FIXED: Explicitly set type to 'int'
  @Column({ name: 'branch_id', nullable: true, type: 'int' })
  branchId: number | null;

  @ManyToOne(() => Branch, (branch) => branch.users, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch | null;

  @OneToMany(() => EmailOtp, emailOtp => emailOtp.user)
  emailOtps: EmailOtp[];

  @OneToMany(() => TicketStatusHistory, history => history.changedBy)
  ticketStatusHistories: TicketStatusHistory[];

  @OneToMany(() => QueueTicket, queueTicket => queueTicket.cancelledBy)
  cancelledTickets: QueueTicket[];

  @OneToMany(() => QueueTicket, queueTicket => queueTicket.issuedBy)
  issuedTickets: QueueTicket[];
}
