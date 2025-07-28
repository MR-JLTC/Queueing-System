// src/staff/entities/staff.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { StaffWindowAssignment } from '../../staff-window-assignments/entities/staff-window-assignment.entity';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity'; // For assignedTickets

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn({ name: 'staff_id' })
  staffId: number;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => Branch, branch => branch.staff)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE', comment: 'ON_LIVE or ON_DELETE' })
  visibilityStatus: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => StaffWindowAssignment, assignment => assignment.staff)
  staffAssignments: StaffWindowAssignment[];

  @OneToMany(() => QueueTicket, ticket => ticket.assignedToStaff)
  assignedTickets: QueueTicket[];

  // Note: No relation to User entity, and no email/password fields here.
  // cancelledTickets relation is NOT here as cancelled_by_id references users.user_id
}
