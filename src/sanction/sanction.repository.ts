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
      acc[curr.name] = curr;
      return acc;
    }, {});

    const existingSanctions = await this.findBy({
      name: In(Object.keys(newSanctionMap)),
    });

    for (let i = 0; i < existingSanctions.length; i++) {
      const existingSanction = existingSanctions[i];
      if (!newSanctionMap[existingSanction.name]) continue;

      existingSanctions[i] = {
        ...existingSanction,
        ...newSanctionMap[existingSanction.name],
      };
      newSanctionMap[existingSanction.name] = null;
    }

    await this.save(existingSanctions);
    await this.save(Object.values(newSanctionMap).filter(Boolean));
  }
}
