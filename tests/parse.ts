import test from 'tape';
import { parse } from '../src';

test('.parse()', t => {
  t.equal(typeof parse, 'function', 'should be a method');

  t.deepEqual(
      parse('i-klingon'),
      {
        language: 'tlh',
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should normalize when possible'
  );

  t.deepEqual(
      parse('i-klingon', {normalize: false}),
      {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: 'i-klingon',
        regular: null
      },
      'should not normalize when `normalize: false`'
  );

  t.deepEqual(
      parse('i-default'),
      {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: 'i-default',
        regular: null
      },
      'should return an irregular when not normalizable'
  );

  t.deepEqual(
      parse('zh-min'),
      {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: 'zh-min'
      },
      'should return a regular when not normalizable'
  );

  t.test('Too long variant', t => {
    var fixture = 'en-GB-abcdefghi';

    t.plan(6);

    t.deepEqual(
        parse(fixture, {warning}),
        {
          language: null,
          extendedLanguageSubtags: [],
          script: null,
          region: null,
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return `null`'
    );

    function warning() {
      t.equal(arguments[0], 'Too long variant, expected at most 8 characters');
      t.equal(arguments[1], 1);
      t.equal(arguments[2], 14);
      t.equal(arguments.length, 3);
    }

    t.deepEqual(
        parse(fixture, {forgiving: true}),
        {
          language: 'en',
          extendedLanguageSubtags: [],
          script: null,
          region: 'GB',
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return untill the error when `forgiving: true`'
    );
  });

  t.test('Too many subtags', t => {
    var fixture = 'aa-bbb-ccc-ddd-eee';

    t.plan(6);

    t.deepEqual(
        parse(fixture, {warning}),
        {
          language: null,
          extendedLanguageSubtags: [],
          script: null,
          region: null,
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return `null`'
    );

    function warning() {
      t.equal(
          arguments[0],
          'Too many extended language subtags, expected at most 3 subtags'
      );
      t.equal(arguments[1], 3);
      t.equal(arguments[2], 14);
      t.equal(arguments.length, 3);
    }

    t.deepEqual(
        parse('aa-bbb-ccc-ddd-eee', {forgiving: true}),
        {
          language: 'aa',
          extendedLanguageSubtags: ['bbb', 'ccc', 'ddd'],
          script: null,
          region: null,
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return untill the error when `forgiving: true`'
    );
  });

  t.test('Too long extension', t => {
    var fixture = 'en-i-abcdefghi';

    t.plan(6);

    t.deepEqual(
        parse(fixture, {warning}),
        {
          language: null,
          extendedLanguageSubtags: [],
          script: null,
          region: null,
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return `null`'
    );

    function warning() {
      t.equal(arguments[0], 'Too long extension, expected at most 8 characters');
      t.equal(arguments[1], 2);
      t.equal(arguments[2], 13);
      t.equal(arguments.length, 3);
    }

    t.deepEqual(
        parse(fixture, {forgiving: true}),
        {
          language: 'en',
          extendedLanguageSubtags: [],
          script: null,
          region: null,
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return untill the error when `forgiving: true`'
    );
  });

  t.test('Empty extension', t => {
    var fixture = 'en-i-a';

    t.plan(6);

    t.deepEqual(
        parse(fixture, {warning}),
        {
          language: null,
          extendedLanguageSubtags: [],
          script: null,
          region: null,
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return `null`'
    );

    function warning() {
      t.equal(
          arguments[0],
          'Empty extension, extensions must have at least 2 characters of content'
      );
      t.equal(arguments[1], 4);
      t.equal(arguments[2], 4);
      t.equal(arguments.length, 3);
    }

    t.deepEqual(
        parse(fixture, {forgiving: true}),
        {
          language: 'en',
          extendedLanguageSubtags: [],
          script: null,
          region: null,
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return untill the error when `forgiving: true`'
    );
  });

  t.test('Too long private-use', t => {
    var fixture = 'en-x-abcdefghi';

    t.plan(6);

    t.deepEqual(
        parse(fixture, {warning}),
        {
          language: null,
          extendedLanguageSubtags: [],
          script: null,
          region: null,
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return `null`'
    );

    function warning() {
      t.equal(
          arguments[0],
          'Too long private-use area, expected at most 8 characters'
      );
      t.equal(arguments[1], 5);
      t.equal(arguments[2], 13);
      t.equal(arguments.length, 3);
    }

    t.deepEqual(
        parse(fixture, {forgiving: true}),
        {
          language: 'en',
          extendedLanguageSubtags: [],
          script: null,
          region: null,
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return untill the error when `forgiving: true`'
    );
  });

  t.test('Extra content', t => {
    var fixture = 'abcdefghijklmnopqrstuvwxyz';

    t.plan(6);

    t.deepEqual(
        parse(fixture, {warning}),
        {
          language: null,
          extendedLanguageSubtags: [],
          script: null,
          region: null,
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return `null`'
    );

    function warning() {
      t.equal(arguments[0], 'Found superfluous content after tag');
      t.equal(arguments[1], 6);
      t.equal(arguments[2], 0);
      t.equal(arguments.length, 3);
    }

    t.deepEqual(
        parse(fixture, {forgiving: true}),
        {
          language: null,
          extendedLanguageSubtags: [],
          script: null,
          region: null,
          variants: [],
          extensions: [],
          privateuse: [],
          irregular: null,
          regular: null
        },
        'should return untill the error when `forgiving: true`'
    );
  });

  t.end();
});
