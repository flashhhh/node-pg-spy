import assert from 'assert';
import parser from '../lib/messageParse/messageParse.js';

describe('messageParse', () => {
  let testMap = [
    [new Buffer([0x53]), {type: 'SSLResponse', data: 'S'}],
    [new Buffer([0x4e]), {type: 'SSLResponse', data: 'N'}],
    [
      (() => {
        let b = new Buffer(16);
        b.writeInt32BE(16, 0, 4);
        b.writeInt32BE(80877102, 4, 4);
        b.writeInt32BE(123456, 8, 4);
        b.writeInt32BE(654321, 12, 4);
        return b;
      })(),
      {type: 'CancelRequest', data: {processId: 123456, secretKey: 654321}}
    ], [
      (() => {
        let b = new Buffer(8);
        b.writeInt32BE(8, 0, 4);
        b.writeInt32BE(80877103, 4, 4);
        return b;
      })(),
      {type: 'SSLRequest', data: null}
    ], [
      (() => {
        let b = new Buffer(37);
        b.writeInt32BE(37, 0, 4);
        b.writeInt32BE(196608, 4, 4);
        b.write('param1\u0000value1\u0000param2\u0000value2\u0000\u0000', 8);
        return b;
      })(),
      {type: 'StartupMessage', data: {
        versionRaw: 196608,
        options: {param1: 'value1', param2: 'value2'}
      }}
    ], [
      (() => {
        let b = new Buffer(47);
        b.write('R', 0, 1);
        b.writeInt32BE(8, 1, 4);
        b.writeInt32BE(0, 5, 4);

        b.write('S', 9, 1);
        b.writeInt32BE(18, 10, 4);
        b.write('param1\u0000value1\u0000', 14, 14);

        b.write('S', 28, 1);
        b.writeInt32BE(18, 29, 4);
        b.write('param2\u0000value2\u0000', 33, 14);
        return b;
      })(),
      {type: 'Messages', data: [
        {type: 'R', length: 4, raw: (new Buffer([0, 0, 0, 0]))},
        {type: 'S', length: 14, raw: (new Buffer('param1\u0000value1\u0000')),
          parsed: {key: 'param1', value: 'value1'}},
        {type: 'S', length: 14, raw: (new Buffer('param2\u0000value2\u0000')),
          parsed: {key: 'param2', value: 'value2'}}
      ]}
    ], [
      (() => {
        let b = new Buffer(23);
        b.write('Q', 0, 1);
        b.writeInt32BE(22, 1, 4);
        b.write('SELECT * FROM foo\u0000', 5);
        return b;
      })(),
      {type: 'Messages', data: [
        {type: 'Q', length: 18, raw: (new Buffer('SELECT * FROM foo\u0000')),
          parsed: 'SELECT * FROM foo'}
      ]}
    ],
    //SSLResponse is one-byte message with S or N
    [new Buffer([0x54]), {type: 'Unrecognized', data: new Buffer([0x54])}]
  ];

  for (let testItem of testMap) {
    it(`raw: ${testItem[0]}, expected: ${testItem[1].type}`, () => {
      assert.equal(testItem.length, 2);
      assert.deepEqual(parser(testItem[0]), testItem[1]);
    });
  }
});
