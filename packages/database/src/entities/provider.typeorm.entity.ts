import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const ProviderEnum = {
  email: { id: 1, name: 'EMAIL' },
  google: { id: 2, name: 'GOOGLE' },
} as const;

@Entity({ name: 'provider' })
export class ProviderEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 20, nullable: false })
  name!: string;
}
