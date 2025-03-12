import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { createHash } from 'crypto';

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

export interface RegimeItem {
  id: string;
}

interface Measure {
  lists: { data: MeasureList[] };
}

interface MeasureList {
  members: { data: Member[] };
}

export interface Member {
  FSD_ID?: string | null;
  type: string;
  name: string;
  id_code?: string;
  creation_date?: string;
  reason?: string;
  data?: Member; // Handling cases where "data" wraps a member
}

export interface RegimeData {
  id: string;
  adopted_by: { data: { title: string } };
  measures: { data: Measure[] };
  specification?: string;
  country: RegimeCountry;
}

interface RegimeCountry {
  data: {
    code: string;
    title: string;
  };
}

enum EuSanctionEntitySchema {
  E = 'LegalEntity',
  P = 'Person',
}

export class EuSanctionMapEntity {
  id: string;
  name: string[];
  schema: string;
  imoNumber = '';
  mmsi = '';
  address: string[] = [];
  notes: string;
  sanction: {
    id: string;
    caption: string;
    schema: string;
    authority: string;
    summary: string;
    address: string[];
    reasons: string;
  } = {
    id: '',
    caption: '',
    schema: '',
    authority: '',
    address: [],
    summary: '',
    reasons: '',
  };

  constructor(member: Member, regimeData: RegimeData) {
    this.id = this.generateHash(`${member.name}-${member.creation_date}`);
    this.name = member.name
      .split(',')
      .map((str) => str.trim())
      .filter(Boolean);
    this.schema = this.getEntitySchema(member);
    this.address.push(regimeData.country.data.title);

    if (this.schema === 'Vessel') {
      const [imoNumber, mmsi] = this.getImoAndMmsiNumberOfVessel(member);

      this.imoNumber = imoNumber;
      this.mmsi = mmsi;
    }

    if (this.schema !== 'Vessel') {
      this.notes = member.id_code;
    }

    this.sanction.id = this.generateHash('sanction' + this.id);
    this.sanction.caption = 'Sanction';
    this.sanction.schema = 'Sanction';
    this.sanction.authority = regimeData.adopted_by.data.title;
    this.sanction.summary = regimeData.specification;
    this.sanction.reasons = member.reason;
    this.sanction.address = this.address;
  }

  private generateHash(id: string): string {
    return createHash('sha256') // Choose hash algorithm (e.g., 'sha256', 'md5', etc.)
      .update(`eu-sanction-map` + id)
      .digest('hex');
  }

  private getEntitySchema(member: Member) {
    let schema = EuSanctionEntitySchema[member.type];
    const idCode = member.id_code;

    if (idCode?.includes('IMO:') || idCode === '8405311') {
      schema = 'Vessel';
    }
    return schema;
  }

  private getImoAndMmsiNumberOfVessel(member: Member) {
    const idCode = member.id_code;
    let imoNumber: string = '';
    let mmsi: string = '';

    for (const code of idCode.split('.')) {
      if (!code.includes(':')) {
        imoNumber = code;
        continue;
      }

      const [type, value] = code.split(': ');
      if (type.includes('IMO')) {
        imoNumber = value;
      }
      if (type.includes('MMSI')) {
        mmsi = value;
      }
    }

    return [imoNumber, mmsi];
  }
}
