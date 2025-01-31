import { DatasetEntity } from 'src/dataset/dataset.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sanctions')
export class SanctionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_id' })
  externalId: string;

  @Column()
  schema: string;

  @Column()
  name: string;

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
