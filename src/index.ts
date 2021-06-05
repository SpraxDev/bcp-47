import { normal, regular } from './constants';

const own = {}.hasOwnProperty;

/**
 * Parse a BCP 47 language tag.
 */
export function parse(tag: string, options?: ParseOptions): Schema {
  const result = emptySchema();
  const tagLower = tag.toLowerCase();
  let index = 0;
  let start: number;
  let groups: number;

  // Let’s start.
  // First: the edge cases.
  if (own.call(normal, tagLower)) {
    const tmp = normal[tagLower];

    if ((options?.normalize == undefined || options.normalize) && tmp) {
      return parse(tmp);
    }

    result[regular.includes(tagLower) ? 'regular' : 'irregular'] = tag;

    return result;
  }

  // Now, to actually parse, eat what could be a language.
  while (isAlphabetical(tagLower.charCodeAt(index)) && index < 9) index++;

  // A language.
  if (index > 1 /* Min 639. */ && index < 9 /* Max subtag. */) {
    // '5' and up is a subtag.
    // '4' is the size of reserved languages.
    // '3' an ISO 639-2 or ISO 639-3.
    // '2' is an ISO 639-1.
    // <https://github.com/wooorm/iso-639-2>
    // <https://github.com/wooorm/iso-639-3>
    result.language = tag.slice(0, index);

    if (index < 4 /* Max 639. */) {
      groups = 0;

      while (tagLower.charCodeAt(index) === 45 /* `-` */ &&
      isAlphabetical(tagLower.charCodeAt(index + 1)) &&
      isAlphabetical(tagLower.charCodeAt(index + 2)) &&
      isAlphabetical(tagLower.charCodeAt(index + 3)) &&
      !isAlphabetical(tagLower.charCodeAt(index + 4))) {
        if (groups > 2 /* Max extended language subtag count. */) {
          return fail(index, 3, 'Too many extended language subtags, expected at most 3 subtags');
        }

        // Extended language subtag.
        result.extendedLanguageSubtags.push(tag.slice(index + 1, index + 4));
        index += 4;
        groups++;
      }
    }

    // ISO 15924 script.
    // <https://github.com/wooorm/iso-15924>
    if (
        tagLower.charCodeAt(index) === 45 /* `-` */ &&
        isAlphabetical(tagLower.charCodeAt(index + 1)) &&
        isAlphabetical(tagLower.charCodeAt(index + 2)) &&
        isAlphabetical(tagLower.charCodeAt(index + 3)) &&
        isAlphabetical(tagLower.charCodeAt(index + 4)) &&
        !isAlphabetical(tagLower.charCodeAt(index + 5))
    ) {
      result.script = tag.slice(index + 1, index + 5);
      index += 5;
    }

    if (tagLower.charCodeAt(index) === 45 /* `-` */) {
      // ISO 3166-1 region.
      // <https://github.com/wooorm/iso-3166>
      if (
          isAlphabetical(tagLower.charCodeAt(index + 1)) &&
          isAlphabetical(tagLower.charCodeAt(index + 2)) &&
          !isAlphabetical(tagLower.charCodeAt(index + 3))
      ) {
        result.region = tag.slice(index + 1, index + 3);
        index += 3;
      }
          // UN M49 region.
      // <https://github.com/wooorm/un-m49>
      else if (
          isDecimal(tagLower.charCodeAt(index + 1)) &&
          isDecimal(tagLower.charCodeAt(index + 2)) &&
          isDecimal(tagLower.charCodeAt(index + 3)) &&
          !isDecimal(tagLower.charCodeAt(index + 4))
      ) {
        result.region = tag.slice(index + 1, index + 4);
        index += 4;
      }
    }

    while (tagLower.charCodeAt(index) === 45 /* `-` */) {
      start = index + 1;
      let offset = start;

      while (isAlphanumerical(tagLower.charCodeAt(offset))) {
        if (offset - start > 7 /* Max variant. */) {
          return fail(
              offset,
              1,
              'Too long variant, expected at most 8 characters'
          );
        }

        offset++;
      }

      if (
          // Long variant.
          offset - start > 4 /* Min alpha numeric variant. */ ||
          // Short variant.
          (offset - start > 3 /* Min variant. */ &&
              isDecimal(tagLower.charCodeAt(start)))
      ) {
        result.variants.push(tag.slice(start, offset));
        index = offset;
      }
      // Something else.
      else {
        break;
      }
    }

    // Extensions.
    while (tagLower.charCodeAt(index) === 45 /* `-` */) {
      // Exit if this isn’t an extension.
      if (
          tagLower.charCodeAt(index + 1) === 120 /* `x` */ ||
          !isAlphanumerical(tagLower.charCodeAt(index + 1)) ||
          tagLower.charCodeAt(index + 2) !== 45 /* `-` */ ||
          !isAlphanumerical(tagLower.charCodeAt(index + 3))
      ) {
        break;
      }

      let offset = index + 2;
      groups = 0;

      while (
          tagLower.charCodeAt(offset) === 45 /* `-` */ &&
          isAlphanumerical(tagLower.charCodeAt(offset + 1)) &&
          isAlphanumerical(tagLower.charCodeAt(offset + 2))
          ) {
        start = offset + 1;
        offset = start + 2;
        groups++;

        while (isAlphanumerical(tagLower.charCodeAt(offset))) {
          if (offset - start > 7 /* Max extension. */) {
            return fail(
                offset,
                2,
                'Too long extension, expected at most 8 characters'
            );
          }

          offset++;
        }
      }

      if (!groups) {
        return fail(
            offset,
            4,
            'Empty extension, extensions must have at least 2 characters of content'
        );
      }

      result.extensions.push({
        singleton: tag.charAt(index + 1),
        extensions: tag.slice(index + 3, offset).split('-')
      });

      index = offset;
    }
  } else {  // Not a language.
    index = 0;
  }

  // Private use.
  if (
      (index === 0 && tagLower.charCodeAt(index) === 120) /* `x` */ ||
      (tagLower.charCodeAt(index) === 45 /* `-` */ &&
          tagLower.charCodeAt(index + 1) === 120) /* `x` */
  ) {
    index = index ? index + 2 : 1;
    let offset = index;

    while (
        tagLower.charCodeAt(offset) === 45 /* `-` */ &&
        isAlphanumerical(tagLower.charCodeAt(offset + 1))
        ) {
      start = index + 1;
      offset = start;

      while (isAlphanumerical(tagLower.charCodeAt(offset))) {
        if (offset - start > 7 /* Max private use. */) {
          return fail(offset, 5, 'Too long private-use area, expected at most 8 characters');
        }

        offset++;
      }

      result.privateuse.push(tag.slice(index + 1, offset));
      index = offset;
    }
  }

  if (index !== tag.length) {
    return fail(index, 6, 'Found superfluous content after tag');
  }

  return result;

  /**
   * Create an empty results object.
   */
  function fail(offset: number, code: number, reason: string): Schema {
    if (options?.warning) options.warning(reason, code, offset);

    return options?.forgiving ? result : emptySchema();
  }
}

/**
 * Create an empty results object.
 */
function emptySchema(): Schema {
  // noinspection SpellCheckingInspection
  return {
    language: null,
    extendedLanguageSubtags: [],
    script: null,
    region: null,
    variants: [],
    extensions: [],
    privateuse: [],
    irregular: null,
    regular: null
  };
}

/**
 * Compile a language schema to a BCP 47 language tag.
 */
export function stringify(schema: SchemaOptions): string {
  let result: string[] = [];

  if (schema.irregular) {
    return schema.irregular;
  } else if (schema.regular) {
    return schema.regular;
  }

  if (schema.language) {
    result = result.concat(
        schema.language,
        schema.extendedLanguageSubtags || [],
        schema.script || [],
        schema.region || [],
        schema.variants || []
    );

    if (schema.extensions) {
      for (const value of schema.extensions) {
        if (value.singleton && value.extensions && value.extensions.length > 0) {
          result = result.concat(value.singleton, value.extensions);
        }
      }
    }
  }

  if (schema.privateuse && schema.privateuse.length > 0) {
    result = result.concat('x', schema.privateuse);
  }

  return result.join('-');
}

function isAlphabetical(char: number): boolean {
  return (char >= 97 && char <= 122) || /* a-z */
      (char >= 65 && char <= 90);       /* A-Z */
}

function isAlphanumerical(character: number): boolean {
  return isAlphabetical(character) || isDecimal(character);
}

function isDecimal(char: number): boolean {
  return char >= 48 && char <= 57; /* 0-9 */
}
