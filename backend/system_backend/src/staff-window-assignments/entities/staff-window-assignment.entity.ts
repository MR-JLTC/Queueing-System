// src/staff-window-assignments/entities/staff-window-assignment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity'; // Import Staff entity
import { ServiceWindow } from '../../service-windows/entities/service-window.entity';
import { AssignmentStatus } from '../../common/enums/assignment-status.enum'; // Import the new enum

@Entity('staff_window_assignments')
export class StaffWindowAssignment {
  @PrimaryGeneratedColumn({ name: 'assignment_id' })
  assignmentId: number;

  @Column({ name: 'staff_id' })
  staffId: number;

  @ManyToOne(() => Staff, staff => staff.staffAssignments) // Link to Staff entity
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ name: 'window_id' })
  windowId: number;

  @ManyToOne(() => ServiceWindow, window => window.staffAssignments)
  @JoinColumn({ name: 'window_id' })
  window: ServiceWindow;

  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.ACTIVE })
  status: AssignmentStatus;

  @Column({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ name: 'released_at', type: 'timestamp', nullable: true })
  releasedAt: Date | null; // Made nullable

  @Column({ name: 'visibility_status', length: 255, default: 'ON_LIVE' })
  visibilityStatus: string;
}
