export default function(buffer) {
  let options = buffer
    .toString('utf8')
    .split('\u0000')
    .slice(0, -1);
  
  return {
    key: options[0],
    value: options[1]
  };
}
