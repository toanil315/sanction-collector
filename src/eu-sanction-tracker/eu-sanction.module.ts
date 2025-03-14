import { Module } from '@nestjs/common';
import { EuSanctionController } from './eu-sanction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EuSanctionProcessor } from './eu-sanction.processor';
import { EuSanctionRepository } from './eu-sanction.repository';
import { EuSanctionEntitySubscriber } from './sanction.entity.subscriber';
import { EuSanctionEntity } from './eu-sanction.entity';
import { EuSanctionMapService } from './eu-sanction.service';
import { EuSanctionDataTransformerFileSaver } from './eu-sanction.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([EuSanctionEntity]),
    BullModule.registerQueue({
      name: 'eu-sanction-queue',
    }),
  ],
  controllers: [EuSanctionController],
  providers: [
    EuSanctionProcessor,
    EuSanctionRepository,
    EuSanctionEntitySubscriber,
    EuSanctionMapService,
    EuSanctionDataTransformerFileSaver,
  ],
})
export class EuSanctionModule {}
