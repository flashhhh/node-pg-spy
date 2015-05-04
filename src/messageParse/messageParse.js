import Reader from 'packet-reader';
import assert from 'assert';

/**
 * @param buffer
 * @param sender string 'client' or 'server' or null (when unknown)
 */
function parse(buffer, sender = null) {
  assert(['client', 'server', null].indexOf(sender) !== -1);
  if (buffer.length === 1) {
    let symbol = buffer.toString();
    if ((['S', 'N']).indexOf(symbol) !== -1) {
      return {
        type: 'SSLResponse',
        data: symbol
      };
    }
  }
  
  if (buffer.length === 8) {
    let len = buffer.readInt32BE(0);
    if (len === 8 && buffer.readInt32BE(4) === 80877103) {
      return {
        type: 'SSLRequest',
        data: null
      };
    }
  }
  
  if (buffer.length === 16) {
    let len = buffer.readInt32BE(0);
    if (len === 16 && buffer.readInt32BE(4) === 80877102) {
      return {
        type: 'CancelRequest',
        data: {
          processId: buffer.readInt32BE(8),
          secretKey: buffer.readInt32BE(12)
        }
      };
    }
  }
  
  if (buffer.length > 8 && buffer.length === buffer.readInt32BE(0)) {
    let versionRaw = buffer.readInt32BE(4);
    let options = buffer.toString('utf8', 8)
      .split('\u0000')
      .slice(0, -2)
      .reduce(
        (prev, cur, index, arr) => {
          if (index % 2 === 0) {
            prev[cur] = arr[index + 1];
          }
          return prev;
        },
        {}
      );
    
    return {
      type: 'StartupMessage',
      data: {
        versionRaw: versionRaw,
        options: options
      }
    };
  }
  
  if (buffer.length >= 5 && buffer.readInt32BE(1) >= 4) {
    let reader = new Reader({
      headerSize: 1,
      lengthPadding: -4
    });
    
    let messages = {
      type: 'Messages',
      data: []
    };

    reader.addChunk(buffer);
    let part = reader.read();
    while (part) {
      let message = {
        type: String.fromCharCode(reader.header),
        length: part.length,
        raw: part
      };
      
      let parsed;
      try {
        let parser = require(`./messages/type${message.type}`);
        parsed = parser(message.raw, sender);
      } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
          throw e;
        }
      }
      if (parsed) {
        message.parsed = parsed;
      }
      
      messages.data.push(message);
      part = reader.read();
    }
    
    return messages;
  }

  return {
    type: 'Unrecognized',
    data: buffer
  };
}

export default parse;
