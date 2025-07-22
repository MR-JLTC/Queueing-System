import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('daily_queue_summary')
export class DailyQueueSummary {
  @PrimaryColumn({ name: 'summary_date', type: 'date' })
  summaryDate: Date;

  @Column({ name: 'total_queued', type: 'int' })
  totalQueued: number;

  @Column({ name: 'total_served', type: 'int' })
  totalServed: number;

  @Column({ name: 'total_requeued', type: 'int' })
  totalRequeued: number;

  @Column({ name: 'senior_count', type: 'int' })
  seniorCount: number;

  @Column({ name: 'pwd_count', type: 'int' })
  pwdCount: number;

  @Column({ name: 'other_count', type: 'int' })
  otherCount: number;

  @Column({ name: 'cancelled_count', type: 'int' })
  cancelledCount: number;
}
