import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { StaffWindowAssignment } from '../../staff-window-assignments/entities/staff-window-assignment.entity'; // Forward declaration
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity'; // Import QueueTicket

@Entity('service_windows') // Renamed table for clarity
export class ServiceWindow {
  @PrimaryGeneratedColumn({ name: 'window_id' }) // Keep window_id for consistency
  windowId: number;

  @Column({ name: 'window_number', unique: true, length: 255 })
  windowNumber: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => Branch, branch => branch.windows)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE' })
  visibilityStatus: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => StaffWindowAssignment, assignment => assignment.window)
  staffAssignments: StaffWindowAssignment[];

  // One service window can process multiple queue tickets
  @OneToMany(() => QueueTicket, ticket => ticket.window) // <--- THIS WILL NOW REFER TO 'window' on QueueTicket
  queueTickets: QueueTicket[];
}