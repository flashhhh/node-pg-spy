export default function(args) {
  let result = {};
  args.forEach((arg, i) => {
    if (arg.indexOf('--') === 0) {
      if (args[i + 1] && args[i + 1].indexOf('--') === -1) {
        result[arg.replace('--', '')] = args[i + 1];
      } else {
        throw Error(`Command line agrument ${arg} has no value!`);
      }
    }
  });
  
  return result;
}
