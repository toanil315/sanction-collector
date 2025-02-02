import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { SanctionEntity } from './sanction.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

@EventSubscriber()
@Injectable()
export class SanctionEntitySubscriber
  implements EntitySubscriberInterface<SanctionEntity>
{
  constructor(@InjectDataSource() readonly datasource: DataSource) {
    datasource.subscribers.push(this);
  }

  listenTo() {
    return SanctionEntity;
  }

  async afterInsert(event: InsertEvent<SanctionEntity>) {
    await this.updateSearchVector(event);
  }

  async afterUpdate(event: UpdateEvent<SanctionEntity>) {
    await this.updateSearchVector(event);
  }

  private async updateSearchVector(
    event: UpdateEvent<SanctionEntity> | InsertEvent<SanctionEntity>,
  ) {
    if (!event.entity) return;
    await event.manager.query(
      `
        UPDATE public.sanctions s
        SET name_text_search = setweight(to_tsvector(coalesce(s."name" , '')), 'A')
        WHERE s.id = $1
      `,
      [event.entity.id],
    );
  }
}
