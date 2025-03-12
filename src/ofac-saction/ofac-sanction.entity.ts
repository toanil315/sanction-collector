export interface RawOfacSanctionResponse {
  sanctionsData: {
    entities: {
      entity: RawOfacSanctionItem[];
    };
  };
}

export interface RawOfacSanctionItem {
  _attributes: {
    id: string;
  };
  generalInfo: {
    identityId: {
      _text: string;
    };
    entityType: {
      _attributes: {
        refId: string;
      };
      _text: string;
    };
  };
  sanctionsLists: {
    sanctionsList: {
      _attributes: {
        refId: string;
        id: string;
        datePublished: string;
      };
      _text: string;
    };
  };
  sanctionsPrograms: {
    sanctionsProgram: {
      _attributes: {
        refId: string;
        id: string;
      };
      _text: string;
    };
  };
  sanctionsTypes: {
    sanctionsType: {
      _attributes: {
        refId: string;
        id: string;
      };
      _text: string;
    };
  };
  legalAuthorities: {
    legalAuthority: {
      _attributes: {
        refId: string;
        id: string;
      };
      _text: string;
    };
  };
  names: {
    name: RawName[];
  };
  addresses: {
    address: Address[];
  };
  identityDocuments: {
    identityDocument: IdentityDocument;
  };
  features?: {
    feature: Feature | Feature[];
  };
}

export interface RawName {
  _attributes: {
    id: string;
  };
  isPrimary: {
    _text: string;
  };
  isLowQuality: {
    _text: string;
  };
  aliasType?: {
    _attributes: {
      refId: string;
    };
    _text: string;
  };
  translations: {
    translation: RawTranslation | RawTranslation[];
  };
}

export interface RawTranslation {
  _attributes: {
    id: string;
  };
  isPrimary: {
    _text: string;
  };
  script: {
    _attributes: {
      refId: string;
    };
    _text: string;
  };
  formattedLastName: {
    _text: string;
  };
  formattedFullName: {
    _text: string;
  };
  nameParts: {
    namePart: RawNamePart;
  };
}

export interface RawNamePart {
  _attributes: {
    id: string;
  };
  type: {
    _attributes: {
      refId: string;
    };
    _text: string;
  };
  value: {
    _text: string;
  };
}

export interface RawAddress {
  _attributes: {
    id: string;
  };
  country: {
    _attributes: {
      refId: string;
    };
    _text: string;
  };
  translations: {
    translation: {
      _attributes: {
        id: string;
      };
      isPrimary: {
        _text: string;
      };
      script: {
        _attributes: {
          refId: string;
        };
        _text: string;
      };
      addressParts?: {
        addressPart: AddressPart[];
      };
    };
  };
}

export interface RawAddressPart {
  _attributes: {
    id: string;
  };
  type: {
    _attributes: {
      refId: string;
    };
    _text: string;
  };
  value: {
    _text: string;
  };
}

export interface RawIdentityDocument {
  _attributes: {
    id: string;
  };
  type: {
    _attributes: {
      refId: string;
    };
    _text: string;
  };
  name: {
    _attributes: {
      nameId: string;
      nameTranslationId: string;
    };
    _text: string;
  };
  documentNumber: {
    _text: string;
  };
  isValid: {
    _text: string;
  };
  issuingCountry: {
    _attributes: {
      refId: string;
    };
    _text: string;
  };
}

export interface RawFeature {
  _attributes: {
    id: string;
  };
  type: {
    _attributes: {
      featureTypeId: string;
    };
    _text: string;
  };
  versionId: {
    _text: string;
  };
  value: {
    _text: string;
  };
  valueRefId?: {
    _text: string;
  };
  isPrimary: {
    _text: string;
  };
  reliability: {
    _attributes: {
      refId: string;
    };
    _text: string;
  };
}

interface AddressPart {
  type: string;
  value: string;
}

export interface Address {
  country: string;
  addressParts: AddressPart[];
}

export interface IdentityDocument {
  type: string;
  name: string;
  documentNumber: string;
  isValid: boolean;
  issuingCountry: string;
}

export interface Feature {
  type: string;
  versionId: string;
  value: string;
  isPrimary: boolean;
  reliability?: string;
}

export interface OfacSanctionedEntity {
  identityId: string;
  entityType: string;
  sanctionsLists: string[];
  sanctionsProgram: string[];
  sanctionsType: string[];
  legalAuthorities: string[];
  names: string[];
  addresses: Address[];
  identityDocuments: IdentityDocument[];
  features: Feature[];
}
