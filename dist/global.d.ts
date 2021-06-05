interface ParseOptions {
    normalize?: boolean;
    forgiving?: boolean;
    warning?: (reason: string, code: number, offset: number) => void;
}
interface Extension {
    singleton: string;
    extensions: string[];
}
interface Schema {
    language: string | null;
    extendedLanguageSubtags: string[];
    script: string | null;
    region: string | null;
    variants: string[];
    extensions: Array<Extension>;
    privateuse: string[];
    irregular: string | null;
    regular: string | null;
}
interface SchemaOptions {
    language?: string | null;
    extendedLanguageSubtags?: string[];
    script?: string | null;
    region?: string | null;
    variants?: string[];
    extensions?: Array<Extension>;
    privateuse?: string[];
    irregular?: string | null;
    regular?: string | null;
}
