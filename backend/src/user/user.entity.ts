import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Post } from '../posts/posts.entity';
import { UserPreferences } from './user-preferences.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  linkedinId: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'text', nullable: true })
  headline: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ type: 'text' })
  accessToken: string;

  @OneToMany(() => Post, post => post.user)
  posts: Post[];

  @OneToOne(() => UserPreferences, preferences => preferences.user)
  preferences: UserPreferences;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
