import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SanctionEntity } from './sanction.entity';
import { DatasetModule } from 'src/dataset/dataset.module';
import { BullModule } from '@nestjs/bull';
import { SanctionController } from './sanction.controller';
import { SanctionProcessor } from './sanction.processor';
import { SanctionRepository } from './sanction.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SanctionEntity]),
    BullModule.registerQueue({
      name: 'sanction-queue',
    }),
    DatasetModule,
  ],
  controllers: [SanctionController],
  providers: [SanctionProcessor, SanctionRepository],
})
export class SanctionModule {}
