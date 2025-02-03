import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('eu_sanctions')
@Index('eu_sanction_name_text_search_idx', { synchronize: false })
export class EuSanctionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  schema: string;

  @Column()
  name: string;

  @Column({ name: 'name_text_search', nullable: true, type: 'tsvector' })
  nameTextSearch: string | null;

  @Column({ name: 'designation_date' })
  designationDate: string;

  @Column()
  regime: string;

  @Column({ nullable: true })
  nationality: string;

  @Column()
  url: string;

  @Column({ name: 'sanction_type' })
  sanctionType: string;
}
