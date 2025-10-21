type CodeType = 'teacher' | 'student' | 'class' | 'default';

const CODE_PREFIXES: Record<CodeType, string> = {
  teacher: 'QNTC',
  student: 'QNST',
  class: 'QNCL',
  default: 'QN'
};

function generateQNCode(type: CodeType = 'default'): string {
  const seed = Date.now() + Math.random();
  const n = Math.floor((seed % 1_000_000));
  const prefix = CODE_PREFIXES[type] || CODE_PREFIXES.default;
  return `${prefix}${n.toString().padStart(6, '0')}`;
}

export { generateQNCode, CodeType };