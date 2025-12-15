const fs = require('fs');
const path = require('path');

describe('Dockerfiles presence', () => {
  const projectRoot = path.resolve(__dirname, '../../../');
  const dockerDir = path.join(projectRoot, 'docker');

  test('docker/Dockerfile exists', () => {
    const p = path.join(dockerDir, 'Dockerfile');
    expect(fs.existsSync(p)).toBe(true);
  });

  test('rfishbase Dockerfile exists', () => {
    const p = path.join(dockerDir, 'rfishbase', 'Dockerfile');
    expect(fs.existsSync(p)).toBe(true);
  });
});
