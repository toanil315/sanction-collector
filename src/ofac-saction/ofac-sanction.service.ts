import { Injectable } from '@nestjs/common';
import { xml2js } from 'xml-js';
import get from 'lodash/get';
import {
  OfacSanctionedEntity,
  RawAddress,
  RawAddressPart,
  RawFeature,
  RawIdentityDocument,
  RawName,
  RawOfacSanctionItem,
  RawOfacSanctionResponse,
} from './ofac-sanction.entity';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { OfacSanctionProcessor } from './ofac-ftm-sanction.mapping';

@Injectable()
export class OfacSanctionService {
  private BASE_END_POINT = 'https://sanctionslistservice.ofac.treas.gov';

  constructor(private ofacSanctionProcessor: OfacSanctionProcessor) {}

  async getEntities() {
    const responses = await Promise.allSettled([
      this.getSanctionLists(),
      this.getSanctionPrograms(),
    ]);

    if (responses.some((res) => res.status === 'rejected')) return [];

    const [lists, programs] = responses as PromiseFulfilledResult<string[]>[];

    for (const list of lists.value) {
      for (const program of programs.value) {
        const entities = await this.getEntitiesBasedOnListAndProgram(
          list,
          program,
        );
        if (!entities) {
          console.log(`Proceed for ${list} and ${program} failed`);
          return;
        }
        console.log(`Start writing into file for ${list} and ${program}`);
        for (const entity of entities) {
          await this.ofacSanctionProcessor.mapAndSaveOfacSanctionToFTM(entity);
        }
        console.log(`Finish writing into file for ${list} and ${program}`);
      }
    }
  }

  async getEntitiesBasedOnListAndProgram(
    list: string,
    program: string,
    retry = true,
  ): Promise<OfacSanctionedEntity[] | null> {
    try {
      const response = await fetch(
        `${this.BASE_END_POINT}/entities?list=${list}&program=${program}`,
      );
      if (!response.ok) return [];
      const xmlEntities = await response.text();
      const entities = xml2js(xmlEntities, {
        compact: true,
      }) as RawOfacSanctionResponse;

      if (
        !entities.sanctionsData.entities ||
        !entities.sanctionsData.entities.entity ||
        !entities.sanctionsData.entities.entity.length
      ) {
        return [];
      }

      return entities.sanctionsData.entities.entity.map(
        this.mapOfacSanctionFromXmlToObject.bind(this),
      );
    } catch (error) {
      console.log(error);
      if (retry) {
        return this.getEntitiesBasedOnListAndProgram(list, program, false);
      }
      return null;
    }
  }

  private async getSanctionLists(): Promise<string[]> {
    const response = await fetch(`${this.BASE_END_POINT}/sanctions-lists`);
    if (!response.ok) return [];
    return response.json();
  }

  private async getSanctionPrograms(): Promise<string[]> {
    const response = await fetch(`${this.BASE_END_POINT}/sanctions-programs`);
    if (!response.ok) return [];
    return response.json();
  }

  private mapOfacSanctionFromXmlToObject(e: RawOfacSanctionItem) {
    return {
      identityId: e.generalInfo.identityId._text,
      entityType: e.generalInfo.entityType._text,
      sanctionsLists: this.extractDataFromXmlField(
        e.sanctionsLists.sanctionsList,
        '_text',
      ),
      sanctionsProgram: this.extractDataFromXmlField(
        e.sanctionsPrograms.sanctionsProgram,
        '_text',
      ),
      sanctionsType: this.extractDataFromXmlField(
        e.sanctionsTypes.sanctionsType,
        '_text',
      ),
      legalAuthorities: this.extractDataFromXmlField(
        e.legalAuthorities.legalAuthority,
        '_text',
      ),
      names: this.extractDataFromXmlField(
        e.names.name,
        null,
        this.getName.bind(this),
      ).flat(),
      addresses: this.extractDataFromXmlField(
        e.addresses.address,
        null,
        this.getAddress.bind(this),
      ),
      identityDocuments: e.identityDocuments
        ? this.extractDataFromXmlField(
            e.identityDocuments.identityDocument,
            null,
            this.getIdentityDocument,
          )
        : [],
      features: e.features
        ? this.extractDataFromXmlField(
            e.features.feature,
            null,
            this.getFeature,
          )
        : [],
    };
  }

  private extractDataFromXmlField(
    field: Record<string, any>,
    path: string | null,
    getFn = get,
  ) {
    if (Array.isArray(field)) return field.map((f) => getFn(f, path));
    return [getFn(field, path)];
  }

  private getName(e: RawName) {
    return this.extractDataFromXmlField(
      e.translations.translation,
      'formattedFullName._text',
    );
  }

  private getAddress(e: RawAddress) {
    return {
      country: e.country?._text,
      addressParts: e.translations?.translation.addressParts
        ? this.extractDataFromXmlField(
            e.translations.translation.addressParts.addressPart,
            null,
            this.getAddressPart,
          )
        : [],
    };
  }

  private getAddressPart(e: RawAddressPart) {
    return {
      type: e?.type._text,
      value: e?.value._text,
    };
  }

  private getIdentityDocument(e: RawIdentityDocument) {
    return {
      type: e?.type?._text,
      name: e?.name?._text,
      documentNumber: e?.documentNumber?._text,
      isValid: e?.isValid?._text === 'true',
      issuingCountry: e?.issuingCountry?._text,
    };
  }

  private getFeature(e: RawFeature) {
    return {
      type: e?.type?._text,
      versionId: e?.versionId?._text,
      value: e?.value?._text,
      isPrimary: e?.isPrimary?._text === 'true',
      reliability: e?.reliability?._text,
    };
  }

  private dropFileIfExist(filePath: string) {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      console.log(`Deleted existing file: ${filePath}`);
    }
  }
}
