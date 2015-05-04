import assert from 'assert';
import querySplit from '../lib/querySplit.js';

describe('querySplit', () => {
  let testMap = [
    ['SELECT 1', 'same'],
    ['SELECT 1;', 'same'],
    ['SELECT 1;;;;', ['SELECT 1;']],
    ['SELECT 1;;SELECT 2;;', ['SELECT 1;', 'SELECT 2;']],
    ['SELECT 1;SELECT 2;', ['SELECT 1;', 'SELECT 2;']],
    ['SELECT \'asd;123\'', 'same'],
    ['SELECT "asd;123"', 'same'],
    ['SELECT "asd;123"; SELECT 1', ['SELECT "asd;123";', 'SELECT 1']],
    ['SELECT $$asd;123$$', 'same'],
    ['SELECT $$asd;123 /* $$ ;*/$$', 'same'],
    ['SELECT $tt$asd;123$tt$', 'same'],
    ['SELECT $tt$asd;\n123$tt$', 'same'],
    ['SELECT 1; -- asd;123', ['SELECT 1;']],
    ['SELECT 1; /* asd;123 */', ['SELECT 1;']],
    ['SELECT 1; /* asd\n;123 */', ['SELECT 1;']],
    ['SELECT 1; /* asd\n;123 */; SELECT 2;', ['SELECT 1;', 'SELECT 2;']],
    ['SELECT 1; /* ; /* ; */ ; */', ['SELECT 1;']],
    ['SELECT 1; /* ; -- ; */', ['SELECT 1;']],
    ['SELECT 1; -- /* ; */', ['SELECT 1;']]
  ];
  
  testMap.forEach((test) => {
    it(test[0], () => {
      if (test[1] === 'same') {
        assert.deepEqual(querySplit(test[0]), [test[0]]);
      } else {
        assert.deepEqual(querySplit(test[0]), test[1]);
      }
    });
  });
});
