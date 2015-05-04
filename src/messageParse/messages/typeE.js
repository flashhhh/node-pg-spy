export default function(buffer, sender) {
  if (sender === 'client') {
    return null;
  }
  
  if (sender === 'server') {
    return buffer.toString('utf8')
      .split('\u0000')
      .slice(0, -2)
      .reduce(
        (prev, cur) => {
          prev[cur.slice(0, 1)] = cur.slice(1);
          return prev;
        },
        {}
      );
  }
  
  throw Error('TypeE parser requires sender to be passed!');
}
