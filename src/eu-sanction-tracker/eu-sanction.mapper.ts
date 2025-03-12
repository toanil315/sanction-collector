import { Injectable } from '@nestjs/common';
import { EuSanctionMapEntity } from './eu-sanction.entity';
import { access, appendFile, constants, writeFile } from 'fs/promises';

@Injectable()
export class EuSanctionDataTransformerFileSaver {
  private filePath = './eu-sanction-map/entities.ftm.json';

  async mapAndSaveEUSanctionToFTM(entity: EuSanctionMapEntity) {
    await this.mapAndSaveSanctionFTM(entity.sanction, entity.id);

    const ftmEntity = {
      id: entity.id,
      caption: entity.name[0],
      schema: entity.schema,
      properties: {
        notes: [entity.notes],
        topics: ['sanction'],
        name: entity.name,
        address: entity.address,
        imoNumber: [],
        mmsi: [],
      },
      datasets: ['eu_sanctions_map'],
    };

    if (ftmEntity.schema === 'Vessel') {
      if (entity.imoNumber) {
        ftmEntity.properties.imoNumber = ['IMO' + String(entity.imoNumber)];
      }

      if (entity.mmsi) {
        ftmEntity.properties.mmsi = [String(entity.mmsi)];
      }
    }
    await this.saveEntityToFile(ftmEntity);
    return ftmEntity;
  }

  private async mapAndSaveSanctionFTM(
    sanction: EuSanctionMapEntity['sanction'],
    entityId: string,
  ) {
    const sanctionFTM = {
      id: sanction.id,
      caption: sanction.caption,
      schema: sanction.schema,
      properties: {
        entity: [entityId],
        country: sanction.address,
        authority: [sanction.authority],
        reason: [sanction.reasons],
        summary: [sanction.summary],
      },
      datasets: ['eu_sanctions_map'],
    };
    await this.saveEntityToFile(sanctionFTM);
    return sanctionFTM;
  }

  private async saveEntityToFile(obj: Record<string, any>) {
    const jsonLine = JSON.stringify(obj) + '\n';

    try {
      await access(this.filePath, constants.F_OK);
    } catch {
      await writeFile(this.filePath, '', 'utf8');
    }

    await appendFile(this.filePath, jsonLine, 'utf8');
  }
}
