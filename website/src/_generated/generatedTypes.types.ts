export namespace GT {
  interface Base {
    kind: string;
    fileName: string;
    name: string;
    sourceUrl: string;
    documentation: Documentation;
  }
  export interface Flags {
    isExported: boolean;
    isExternal: boolean;
    isOptional: boolean;
    isPrivate: boolean;
    isProtected: boolean;
    isPublic: boolean;
    isRest: boolean;
    isStatic: boolean;
  }

  export interface Documentation {
    contentsRaw: string;
    contents: string[];
  }
  export interface Property extends Base {
    flags: Flags;
    kind: "property";
    type: string;
  }
  export interface Parameter extends Base {
    flags: Flags;
    kind: "parameter";
    type: string;
  }
  export interface MethodSignature extends Base {
    kind: "signature";
    parameters: Parameter[];
    returnType: string;
    type: string;
  }
  export interface Method extends Base {
    kind: "method";
    signatures: MethodSignature[];
    flags: Flags;
  }
  export interface Interface extends Base {
    kind: "interface";
    flags: Flags;
    methods: Method[];
    properties: Property[];
  }
  export interface EnumMember extends Base {
    kind: "enum-member";
  }
  export interface Enum extends Base {
    kind: "enum";
    members: EnumMember[];
  }
  export interface Class extends Base {
    flags: Flags;
    kind: "class";
    implements: string[];
    methods: Method[];
    sourceUrl: string;
    properties: Property[];
    accessors: Property[];
    constructorType: Method;
  }
}
