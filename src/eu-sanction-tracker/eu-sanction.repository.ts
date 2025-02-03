import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { EuSanctionEntity } from './eu-sanction.entity';

@Injectable()
export class EuSanctionRepository extends Repository<EuSanctionEntity> {
  constructor(dataSource: DataSource) {
    super(EuSanctionEntity, dataSource.createEntityManager());
  }

  async bulkUpsert(sanctions: Partial<EuSanctionEntity>[]) {
    const newSanctionMap = sanctions.reduce<
      Record<string, Partial<EuSanctionEntity>>
    >((acc, curr) => {
      acc[curr.name.toLowerCase()] = curr;
      return acc;
    }, {});

    const existingSanctions = await this.createQueryBuilder('sanction')
      .where('LOWER(sanction.name) IN (:...names)', {
        names: Object.keys(newSanctionMap),
      })
      .getMany();

    for (let i = 0; i < existingSanctions.length; i++) {
      const existingSanction = existingSanctions[i];

      existingSanctions[i] = {
        ...existingSanction,
        ...newSanctionMap[existingSanction.name.toLowerCase()],
      };
      newSanctionMap[existingSanction.name.toLowerCase()] = null;
    }

    await this.save(existingSanctions);
    await this.save(Object.values(newSanctionMap).filter(Boolean));
  }
}
