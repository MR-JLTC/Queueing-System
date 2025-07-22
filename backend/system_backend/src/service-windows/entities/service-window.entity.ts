import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { StaffWindowAssignment } from '../../staff-window-assignments/entities/staff-window-assignment.entity';
import { QueueTicket } from '../../queue-tickets/entities/queue-ticket.entity';

@Entity('service_windows')
export class ServiceWindow {
  @PrimaryGeneratedColumn({ name: 'window_id' })
  windowId: number;

  @Column({ name: 'counter_label', length: 255 })
  counterLabel: string;

  @Column({ name: 'service_area', length: 255 })
  serviceArea: string;

  @Column({ name: 'is_open', type: 'boolean' })
  isOpen: boolean;

  @Column({ name: 'visibility_status', length: 255, comment: 'ON_LIVE or ON_DELETE' })
  visibilityStatus: string;

  @OneToMany(() => StaffWindowAssignment, assignment => assignment.window)
  staffAssignments: StaffWindowAssignment[];

  @OneToMany(() => QueueTicket, ticket => ticket.window)
  queueTickets: QueueTicket[];
}
