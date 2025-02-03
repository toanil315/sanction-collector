import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DatasetEntity } from '../dataset/dataset.entity';

@Entity('sanctions')
@Index('sanction_name_text_search_idx', { synchronize: false })
export class SanctionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_id' })
  externalId: string;

  @Column()
  schema: string;

  @Column()
  name: string;

  @Column({ name: 'name_text_search', nullable: true, type: 'tsvector' })
  nameTextSearch: string | null;

  @Column({ name: 'last_change' })
  lastChange: string;

  @Column({ name: 'properties', type: 'jsonb' })
  properties: Record<string, any>;

  @Column({ name: 'dataset_id' })
  datasetId: string;

  @ManyToOne(() => DatasetEntity, (dataset) => dataset.sanctions)
  @JoinColumn({ name: 'dataset_id' })
  dataset: DatasetEntity;
}
