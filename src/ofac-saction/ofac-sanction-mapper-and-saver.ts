import { createHash } from 'crypto';
import {
  Address,
  IdentityDocument,
  OfacSanctionedEntity,
} from './ofac-sanction.entity';
import { access, appendFile, constants, writeFile } from 'fs/promises';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OfacSanctionDataTransformerFileSaver {
  private filePath = './ofac/entities.ftm.json';

  static IDENTIFICATION_DOCUMENT_TYPES = [
    'Travel Document Number',
    'Stateless Person ID Card',
    "Seafarer's Identification Document",
    'Cartilla de Servicio Militar Nacional',
    "Driver's License No.",
    'Electoral Registry No.',
    'Trade License No.',
    'Tourism License No.',
    'Pilot License Number',
    'Tarjeta Profesional',
    'License',
    'Birth Certificate Number',
    'Public Security and Immigration No.',
    'Afghan Money Service Provider License Number',
    'MSB Registration Number',
    'SRE Permit No',
    'SRE Permit No.',
    'Immigration No.',
    'VisaNumberID',
    'Refugee ID Card',
    'File Number',
    'US FEIN',
    'Government Gazette Number',
    'Folio Mercantil No.',
    'Central Registration System Number',
    'National Foreign ID Number',
    'National ID No.',
    'Identification Number',
    'Cedula No.',
    'NIT #',
    'C.U.R.P',
    'C.U.R.P.',
    'D.N.I.',
    'C.U.I.T.',
    'C.U.I.P.',
    'Personal ID Card',
    "Citizen's Card Number",
    'Kenyan ID No.',
    'Bosnian Personal ID No.',
    'Tazkira National ID Card',
    'Moroccan Personal ID No.',
    'Turkish Identification Number',
    'Numero de Identidad',
    'Credencial electoral',
    'I.F.E. # electoral, mexico',
    'C.U.I. # guatemala',
    'N.I.E. # spain foreigners',
    'Residency Number',
    'United Social Credit Code Certificate (USCCC)',
    'Unified Social Credit Code (USCC)',
    'CNP (Personal Numerical Code)',
    'Romanian Permanent Resident',
    'Numero Unico de Identificacao Tributaria (NUIT)',
    'UAE Identification',
    'Romanian C.R.',
  ];
  static PASSPORT_DOCUMENT_TYPES = [
    'Passport',
    'Diplomatic Passport',
    'British National Overseas Passport',
    'Stateless Person Passport',
  ];
  static REGISTRATION_DOCUMENT_TYPES = [
    'Commercial Registry Number',
    'Registration Number',
    'Registered Charity No.',
    'Registration ID',
    'Company Number',
    'Business Registration Document #',
    'Matricula Mercantil No',
    'Dubai Chamber of Commerce Membership No.',
    'Business Registration Number',
    'UK Company Number',
    'Certificate of Incorporation Number',
    'Business Number',
    'Public Registration Number',
    'Chinese Commercial Code',
    'C.R. No.',
    'Chamber of Commerce Number',
    'Serial No.',
    'Public Registration Number',
    'Enterprise Number',
    'Istanbul Chamber of Comm. No.',
    'RSIN',
    'Organization Code',
    'Economic Register Number (CBLS)',
    'Trademark number',
    'Permit Number',
    'Military Registration Number',
    'C.I.N.',
    'Registration Certificate Number (Dubai)',
  ];
  static ID_NUMBER_DOCUMENT_TYPES = [
    'Travel Document Number',
    'Stateless Person ID Card',
    "Seafarer's Identification Document",
    'Cartilla de Servicio Militar Nacional',
    "Driver's License No.",
    'Electoral Registry No.',
    'Trade License No.',
    'Tourism License No.',
    'Pilot License Number',
    'Tarjeta Profesional',
    'License',
    'Birth Certificate Number',
    'Public Security and Immigration No.',
    'Afghan Money Service Provider License Number',
    'MSB Registration Number',
    'SRE Permit No',
    'SRE Permit No.',
    'Immigration No.',
    'VisaNumberID',
    'Refugee ID Card',
    'File Number',
    'US FEIN',
    'Government Gazette Number',
    'Folio Mercantil No.',
    'Central Registration System Number',
    'National Foreign ID Number',
    'National ID No.',
    'Identification Number',
    'Cedula No.',
    'NIT #',
    'C.U.R.P',
    'C.U.R.P.',
    'D.N.I.',
    'C.U.I.T.',
    'C.U.I.P.',
    'Personal ID Card',
    "Citizen's Card Number",
    'Kenyan ID No.',
    'Bosnian Personal ID No.',
    'Tazkira National ID Card',
    'Moroccan Personal ID No.',
    'Turkish Identification Number',
    'Numero de Identidad',
    'Credencial electoral',
    'I.F.E. # electoral, mexico',
    'C.U.I. # guatemala',
    'N.I.E. # spain foreigners',
    'Residency Number',
    'United Social Credit Code Certificate (USCCC)',
    'Unified Social Credit Code (USCC)',
    'CNP (Personal Numerical Code)',
    'Romanian Permanent Resident',
    'Numero Unico de Identificacao Tributaria (NUIT)',
    'UAE Identification',
    'Romanian C.R.',
  ];
  static TAX_NUMBER_DOCUMENT_TYPES = [
    'Tax ID No.',
    'RUC #',
    'R.F.C.',
    'RFC',
    'Italian Fiscal Code',
    'RIF #',
    'RTN',
    'Fiscal Code',
    'Paraguayan tax identification number',
    'Romanian Tax Registration',
    'C.I.F.',
    'N.I.F.',
  ];
  static SCHEMA_TYPES = {
    Individual: 'Person',
    Entity: 'Organization',
    Vessel: 'Vessel',
  };

  async mapAndSaveOfacSanctionToFTM(sanction: OfacSanctionedEntity) {
    switch (sanction.entityType) {
      case 'Individual': {
        return this.mapAndSavePersonFTM(sanction);
      }

      case 'Entity': {
        return this.mapAndSaveOrganizationFTM(sanction);
      }

      case 'Vessel': {
        return this.mapAndSaveVesselFTM(sanction);
      }

      default: {
        return;
      }
    }
  }

  private async mapAndSaveVesselFTM(sanction: OfacSanctionedEntity) {
    const generalInfo = this.getGeneralInfo(sanction);

    await this.mapAndSaveSanctionFTM(sanction, generalInfo.id);

    const vesselFTM = {
      ...generalInfo,
      properties: {
        ...this.getVesselProperties(sanction),
      },
      datasets: sanction.sanctionsLists,
    };
    await this.saveEntityToFile(vesselFTM);
    return vesselFTM;
  }

  private async mapAndSaveOrganizationFTM(sanction: OfacSanctionedEntity) {
    const generalInfo = this.getGeneralInfo(sanction);

    const addressFTMs = [];
    for (const addr of sanction.addresses) {
      const addrFTM = await this.mapAndSaveAddressFTM(
        addr,
        generalInfo.id,
        sanction.sanctionsLists,
      );
      if (!addrFTM) continue;
      addressFTMs.push(addrFTM);
    }

    await this.mapAndSaveSanctionFTM(sanction, generalInfo.id);

    const organizationFTM = {
      ...generalInfo,
      properties: {
        ...this.getOrganizationProperties(sanction),
        addressEntity: addressFTMs.map((addr) => addr.id),
      },
      datasets: sanction.sanctionsLists,
    };
    await this.saveEntityToFile(organizationFTM);
    return organizationFTM;
  }

  private async mapAndSavePersonFTM(sanction: OfacSanctionedEntity) {
    const generalInfo = this.getGeneralInfo(sanction);

    for (const doc of sanction.identityDocuments.filter((doc) =>
      OfacSanctionDataTransformerFileSaver.PASSPORT_DOCUMENT_TYPES.includes(
        doc.type,
      ),
    )) {
      await this.mapAndSavePassportFTM(
        doc,
        generalInfo.id,
        sanction.sanctionsLists,
      );
    }

    const addressFTMs = [];
    for (const addr of sanction.addresses) {
      const addrFTM = await this.mapAndSaveAddressFTM(
        addr,
        generalInfo.id,
        sanction.sanctionsLists,
      );
      if (!addrFTM) continue;
      addressFTMs.push(addrFTM);
    }

    const identificationFTMs = [];
    for (const doc of sanction.identityDocuments.filter((doc) =>
      OfacSanctionDataTransformerFileSaver.IDENTIFICATION_DOCUMENT_TYPES.includes(
        doc.type,
      ),
    )) {
      const identificationFTM = await this.mapAndSaveIdentificationFTM(
        doc,
        generalInfo.id,
        sanction.sanctionsLists,
      );
      if (!identificationFTM) continue;
      identificationFTMs.push(identificationFTM);
    }

    await this.mapAndSaveSanctionFTM(sanction, generalInfo.id);

    const personFTM = {
      ...generalInfo,
      properties: {
        ...this.getPersonProperties(sanction),
        addressEntity: addressFTMs.map((addr) => addr.id),
      },
      datasets: sanction.sanctionsLists,
    };
    await this.saveEntityToFile(personFTM);
    return personFTM;
  }

  private async mapAndSavePassportFTM(
    document: IdentityDocument,
    holderId: string,
    sanctionLists: string[],
  ) {
    if (!document || !holderId) return;
    const passportFTM = {
      id: this.genHash(holderId + document.documentNumber),
      caption: document.documentNumber,
      schema: 'Passport',
      properties: {
        number: [document.documentNumber],
        type: ['Passport'],
        holder: [holderId],
        country: [document.issuingCountry],
      },
      datasets: sanctionLists,
    };
    await this.saveEntityToFile(passportFTM);
    return passportFTM;
  }

  private async mapAndSaveAddressFTM(
    address: Address,
    personId: string,
    sanctionLists: string[],
  ) {
    if (!address.country && !address.addressParts.length) return;
    const caption = `${address.country}, ${address.addressParts.map((part) => part.value).join(',')}`;
    const addrFTM = {
      id: this.genHash(personId + caption),
      caption,
      schema: 'Address',
      properties: {
        full: [caption],
        country: [address.country],
        city: [
          address.addressParts.find((part) => part.type === 'CITY')?.value,
        ],
      },
      datasets: sanctionLists,
    };
    await this.saveEntityToFile(addrFTM);
    return addrFTM;
  }

  private async mapAndSaveIdentificationFTM(
    doc: IdentityDocument,
    holderId: string,
    sanctionLists: string[],
  ) {
    if (!doc || !holderId) return;
    const identificationFTM = {
      id: this.genHash(holderId + doc.documentNumber),
      caption: doc.documentNumber,
      schema: 'Identification',
      properties: {
        holder: [holderId],
        number: [doc.documentNumber],
        country: [doc.issuingCountry],
        type: [doc.type],
      },
      datasets: sanctionLists,
    };
    await this.saveEntityToFile(identificationFTM);
    return identificationFTM;
  }

  private async mapAndSaveSanctionFTM(
    sanction: OfacSanctionedEntity,
    entityId: string,
  ) {
    const sanctionFTM = {
      id: this.genHash(
        entityId +
          sanction.sanctionsLists.join() +
          sanction.sanctionsProgram.join(),
      ),
      caption: sanction.sanctionsLists.find(Boolean),
      schema: 'Sanction',
      properties: {
        program: sanction.sanctionsProgram,
        entity: [entityId],
        authority: sanction.legalAuthorities,
      },
      datasets: sanction.sanctionsLists,
    };
    await this.saveEntityToFile(sanctionFTM);
    return sanctionFTM;
  }

  private async saveEntityToFile(obj: Record<string, any>) {
    const nonEmptyFieldObj = this.removeEmptyValues({
      id: obj.id,
      caption: obj.caption,
      schema: obj.schema,
      datasets: obj.datasets,
      properties: this.removeEmptyValues(obj.properties),
    });
    const jsonLine = JSON.stringify(nonEmptyFieldObj) + '\n';

    try {
      await access(this.filePath, constants.F_OK);
    } catch {
      await writeFile(this.filePath, '', 'utf8');
    }

    await appendFile(this.filePath, jsonLine, 'utf8');
  }

  removeEmptyValues(obj: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            value = value.filter(Boolean);
          }
          return [key, value];
        })
        .filter(([_, value]) => {
          if (Array.isArray(value)) return value.length > 0;
          return value !== undefined && value !== null;
        }),
    );
  }

  private genHash(name: string) {
    return createHash('sha256') // Choose hash algorithm (e.g., 'sha256', 'md5', etc.)
      .update(`ofac-${name}`)
      .digest('hex');
  }

  private getGeneralInfo(sanction: OfacSanctionedEntity) {
    const id = this.genHash(sanction.names.join());
    const caption = sanction.names[0];
    const schema =
      OfacSanctionDataTransformerFileSaver.SCHEMA_TYPES[sanction.entityType];
    return { id, caption, schema };
  }

  private getPersonProperties(sanction: OfacSanctionedEntity) {
    return {
      name: sanction.names,
      birthDate: this.getBirthDate(sanction),
      country: this.getCountry(sanction),
      gender: this.getGender(sanction),
      birthPlace: this.getBirthPlace(sanction),
      passportNumber: this.getPassportNumber(sanction),
      topics: ['sanction'],
      address: this.getAddresses(sanction),
      nationality: this.getNationality(sanction),
      idNumber: this.getIdNumber(sanction),
    };
  }

  private getBirthDate(sanction: OfacSanctionedEntity) {
    const birthDate = sanction.features.find(
      (feat) => feat.type === 'Birthdate',
    );
    if (birthDate) {
      return [birthDate.value];
    }
    return [];
  }

  private getCountry(sanction: OfacSanctionedEntity) {
    const countries = sanction.addresses.filter((address) =>
      Boolean(address.country),
    );
    if (countries.length) {
      return countries.map((c) => c.country);
    }
    return [];
  }

  private getGender(sanction: OfacSanctionedEntity) {
    const gender = sanction.features.find((feat) => feat.type === 'Gender');
    if (gender) {
      return [sanction.features.find((feat) => feat.type === 'Gender')?.value];
    }
    return [];
  }

  private getBirthPlace(sanction: OfacSanctionedEntity) {
    const birthPlace = sanction.features.find(
      (feat) => feat.type === 'Place of Birth',
    );
    if (birthPlace) {
      return [
        sanction.features.find((feat) => feat.type === 'Place of Birth')?.value,
      ];
    }
    return [];
  }

  private getPassportNumber(sanction: OfacSanctionedEntity) {
    const passportDocs = sanction.identityDocuments.filter((doc) =>
      OfacSanctionDataTransformerFileSaver.PASSPORT_DOCUMENT_TYPES.includes(
        doc.type,
      ),
    );
    if (passportDocs.length) {
      return passportDocs.map((doc) => doc.documentNumber);
    }

    return [];
  }

  private getAddresses(sanction: OfacSanctionedEntity) {
    const addresses = sanction.addresses.map((address) => {
      if (!address.country) return;
      return (
        address.country +
        address.addressParts.map((part) => part.value).join(',')
      );
    });
    if (addresses.length) {
      return addresses;
    }

    return [];
  }

  private getNationality(sanction: OfacSanctionedEntity) {
    const nationality = sanction.features.find(
      (feat) => feat.type === 'Nationality Country',
    );
    if (nationality) {
      return [nationality.value];
    }
    return [];
  }

  private getOrganizationProperties(sanction: OfacSanctionedEntity) {
    return {
      name: sanction.names,
      address: this.getAddresses(sanction),
      country: this.getCountry(sanction),
      topics: ['sanction'],
      registrationNumber: this.getRegistrationNumber(sanction),
      idNumber: this.getIdNumber(sanction),
      taxNumber: this.getTaxNumber(sanction),
    };
  }

  private getRegistrationNumber(sanction: OfacSanctionedEntity) {
    const registrationDocs = sanction.identityDocuments.filter((doc) =>
      OfacSanctionDataTransformerFileSaver.REGISTRATION_DOCUMENT_TYPES.includes(
        doc.type,
      ),
    );
    if (registrationDocs.length) {
      return registrationDocs.map((doc) => doc.documentNumber);
    }

    return [];
  }

  private getIdNumber(sanction: OfacSanctionedEntity) {
    const idDocs = sanction.identityDocuments.filter((doc) =>
      OfacSanctionDataTransformerFileSaver.ID_NUMBER_DOCUMENT_TYPES.includes(
        doc.type,
      ),
    );
    if (idDocs.length) {
      return idDocs.map((doc) => doc.documentNumber);
    }

    return [];
  }

  private getTaxNumber(sanction: OfacSanctionedEntity) {
    const taxNumberDocs = sanction.identityDocuments.filter((doc) =>
      OfacSanctionDataTransformerFileSaver.TAX_NUMBER_DOCUMENT_TYPES.includes(
        doc.type,
      ),
    );
    if (taxNumberDocs.length) {
      return taxNumberDocs.map((doc) => doc.documentNumber);
    }

    return [];
  }

  private getVesselProperties(sanction: OfacSanctionedEntity) {
    return {
      name: sanction.names,
      topics: ['sanction'],
      immoNumber: this.getVesselImmoNumber(sanction),
      mmsi: this.getVesselMMSI(sanction),
      flag: this.getVesselFlag(sanction),
      type: this.getVesselType(sanction),
      callSign: this.getVesselCallSign(sanction),
      tonnage: this.getVesselTonnage(sanction),
      owner: this.getVesselOwner(sanction),
    };
  }

  private getVesselImmoNumber(sanction: OfacSanctionedEntity) {
    const immoNumber = sanction.identityDocuments.find(
      (doc) => doc.type === 'Vessel Registration Identification',
    );
    if (immoNumber) {
      return [immoNumber.documentNumber.replace(' ', '')];
    }
    return [];
  }

  private getVesselMMSI(sanction: OfacSanctionedEntity) {
    const mmsiNumber = sanction.identityDocuments.find(
      (doc) => doc.type === 'MMSI',
    );
    if (mmsiNumber) {
      return [mmsiNumber.documentNumber];
    }
    return [];
  }

  private getVesselFlag(sanction: OfacSanctionedEntity) {
    const flag = sanction.features.find((feat) => feat.type === 'Vessel Flag');
    if (flag) {
      return [flag.value];
    }
    return [];
  }

  private getVesselType(sanction: OfacSanctionedEntity) {
    const type = sanction.features.find((feat) => feat.type === 'VESSEL TYPE');
    if (type) {
      return [type.value];
    }
    return [];
  }

  private getVesselCallSign(sanction: OfacSanctionedEntity) {
    const callSign = sanction.features.find(
      (feat) => feat.type === 'Vessel Call Sign',
    );
    if (callSign) {
      return [callSign.value];
    }
    return [];
  }

  private getVesselTonnage(sanction: OfacSanctionedEntity) {
    const tonnage = sanction.features.find(
      (feat) => feat.type === 'Vessel Gross Registered Tonnage',
    );
    if (tonnage) {
      return [tonnage.value];
    }
    return [];
  }

  private getVesselOwner(sanction: OfacSanctionedEntity) {
    const owner = sanction.features.find(
      (feat) => feat.type === 'Vessel Owner',
    );
    if (owner) {
      return [owner.value];
    }
    return [];
  }
}
