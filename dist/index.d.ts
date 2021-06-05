/**
 * Parse a BCP 47 language tag.
 */
export declare function parse(tag: string, options?: ParseOptions): Schema;
/**
 * Compile a language schema to a BCP 47 language tag.
 */
export declare function stringify(schema: SchemaOptions): string;
