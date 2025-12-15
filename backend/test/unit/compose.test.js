const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

describe('docker-compose.yml', () => {
  const projectRoot = path.resolve(__dirname, '../../../');
  const composePath = path.join(projectRoot, 'docker', 'docker-compose.yml');
  let compose;

  beforeAll(() => {
    const raw = fs.readFileSync(composePath, 'utf8');
    compose = YAML.parse(raw);
  });

  test('defines expected services', () => {
    const expected = ['postgres', 'pgadmin', 'backend', 'frontend', 'rfishbase'];
    expected.forEach(svc => {
      expect(compose.services[svc]).toBeDefined();
    });
  });

  test('postgres has a healthcheck', () => {
    expect(compose.services.postgres.healthcheck).toBeDefined();
  });

  test('rfishbase has a healthcheck', () => {
    expect(compose.services.rfishbase.healthcheck).toBeDefined();
  });
});
