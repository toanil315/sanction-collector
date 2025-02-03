import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { EuSanctionEntity } from './eu-sanction.entity';

@EventSubscriber()
@Injectable()
export class EuSanctionEntitySubscriber
  implements EntitySubscriberInterface<EuSanctionEntity>
{
  constructor(@InjectDataSource() readonly datasource: DataSource) {
    datasource.subscribers.push(this);
  }

  listenTo() {
    return EuSanctionEntity;
  }

  async afterInsert(event: InsertEvent<EuSanctionEntity>) {
    await this.updateSearchVector(event);
  }

  async afterUpdate(event: UpdateEvent<EuSanctionEntity>) {
    await this.updateSearchVector(event);
  }

  private async updateSearchVector(
    event: UpdateEvent<EuSanctionEntity> | InsertEvent<EuSanctionEntity>,
  ) {
    if (!event.entity) return;
    await event.manager.query(
      `
        UPDATE public.eu_sanctions s
        SET name_text_search = setweight(to_tsvector(coalesce(s."name" , '')), 'A')
        WHERE s.id = $1
      `,
      [event.entity.id],
    );
  }
}
