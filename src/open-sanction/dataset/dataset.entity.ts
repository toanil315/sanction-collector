import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SanctionEntity } from '../sanction/sanction.entity';

@Entity('datasets')
export class DatasetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  url: string;

  @Column({ name: 'json_url' })
  jsonUrl: string;

  @OneToMany(() => SanctionEntity, (sanction) => sanction.dataset)
  sanctions: SanctionEntity[];
}
