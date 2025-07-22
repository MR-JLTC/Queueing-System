import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('email_otp')
export class EmailOtp {
  @PrimaryGeneratedColumn({ name: 'otp_id' })
  otpId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, user => user.emailOtps)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'otp_code', length: 255 })
  otpCode: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'datetime', nullable: true })
  usedAt: Date;
}