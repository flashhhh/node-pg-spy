export default function(buffer) {
  return buffer
    .toString('utf8')
    .slice(0, -1); //last byte is null-byte
}
