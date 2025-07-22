import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceWindow } from '../../service-windows/entities/service-window.entity';

@Entity('staff_window_assignments')
export class StaffWindowAssignment {
  @PrimaryGeneratedColumn({ name: 'assignment_id' })
  assignmentId: number;

  @Column({ name: 'staff_id' })
  staffId: number;

  @ManyToOne(() => User, user => user.staffAssignments)
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @Column({ name: 'window_id' })
  windowId: number;

  @ManyToOne(() => ServiceWindow, window => window.staffAssignments)
  @JoinColumn({ name: 'window_id' })
  window: ServiceWindow;

  @Column({ name: 'assigned_from', type: 'datetime' })
  assignedFrom: Date;

  @Column({ name: 'assigned_to', type: 'datetime', nullable: true })
  assignedTo: Date;

  @Column({ name: 'visibility_status', length: 255, comment: 'ON_LIVE or ON_DELETE' })
  visibilityStatus: string;
}