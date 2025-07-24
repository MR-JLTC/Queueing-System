import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Import User
import { ServiceWindow } from '../../service-windows/entities/service-window.entity'; // Import ServiceWindow

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_BREAK = 'ON_BREAK',
  ENDED = 'ENDED',
}

@Entity('staff_window_assignments')
export class StaffWindowAssignment {
  @PrimaryGeneratedColumn({ name: 'assignment_id' })
  assignmentId: number;

  @Column({ name: 'staff_id' })
  staffId: number;

  @ManyToOne(() => User, user => user.staffAssignments) // <--- This now expects 'staffAssignments' on User
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @Column({ name: 'window_id' })
  windowId: number;

  @ManyToOne(() => ServiceWindow, serviceWindow => serviceWindow.staffAssignments)
  @JoinColumn({ name: 'window_id' })
  window: ServiceWindow;

  @Column({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ name: 'released_at', type: 'timestamp', nullable: true })
  releasedAt: Date | null;

  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.ACTIVE })
  status: AssignmentStatus;

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE' })
  visibilityStatus: string;
}