import * as fs from 'fs';
import * as path from 'path';
import { parse, stringify } from '../src';
import test = require('tape');

test('fixtures', t => {
  const base = path.join(__dirname, 'fixtures');
  const files = fs.readdirSync(base).filter((d) => d.charAt(0) != '.');
  let index = -1;
  let filename;
  let tag;
  let actual;
  let expected;

  while (++index < files.length) {
    filename = files[index];
    tag = path.basename(filename, path.extname(filename));
    actual = parse(tag, {normalize: false});
    expected = JSON.parse(fs.readFileSync(path.join(base, filename), 'utf-8'));

    t.deepEqual(actual, expected, 'should parse `' + tag + '`');
    t.equal(stringify(actual), tag, 'should stringify `' + tag + '`');
  }

  t.end();
});
