import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { SanctionEntity } from './sanction.entity';

@Injectable()
export class SanctionRepository extends Repository<SanctionEntity> {
  constructor(dataSource: DataSource) {
    super(SanctionEntity, dataSource.createEntityManager());
  }

  async bulkUpsert(sanctions: Partial<SanctionEntity>[]) {
    const newSanctionMap = sanctions.reduce<
      Record<string, Partial<SanctionEntity>>
    >((acc, curr) => {
      acc[curr.externalId] = curr;
      return acc;
    }, {});

    const existingSanctions = await this.findBy({
      externalId: In(Object.keys(newSanctionMap)),
    });

    for (let i = 0; i < existingSanctions.length; i++) {
      const existingSanction = existingSanctions[i];

      existingSanctions[i] = {
        ...existingSanction,
        ...newSanctionMap[existingSanction.externalId],
      };
      newSanctionMap[existingSanction.externalId] = null;
    }

    await this.save(existingSanctions);
    await this.save(Object.values(newSanctionMap).filter(Boolean));
  }
}
