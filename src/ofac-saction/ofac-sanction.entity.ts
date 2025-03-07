export interface OfacSanctionResponse {
  sanctionsData: {
    entities: {
      entity: OfacSanctionItem[];
    };
  };
}

export interface OfacSanctionItem {
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
    name: Name[];
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

export interface Name {
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
    translation: Translation | Translation[];
  };
}

export interface Translation {
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
    namePart: NamePart;
  };
}

export interface NamePart {
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

export interface Address {
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

export interface AddressPart {
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

export interface IdentityDocument {
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

export interface Feature {
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
