export default function(buffer) {
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
