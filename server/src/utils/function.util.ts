function generateQNCode() {
  const seed = Date.now() + Math.random();
  const n = Math.floor((seed % 1_000_000));
  return `QN${n.toString().padStart(6, '0')}`;
}

export { generateQNCode };