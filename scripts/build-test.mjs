import { spawn } from 'child_process';
import fs from 'fs';
const child = spawn('npx', ['next', 'build'], {
  env: {
    ...process.env,
    DATABASE_URL: 'mysql://dummy:dummy@127.0.0.1:3306/dummy',
    NEXTAUTH_SECRET: 'dummy-secret-for-building-only-change-in-prod',
    NEXTAUTH_URL: 'http://localhost:3000',
    NEXT_PUBLIC_BASE_PATH: '',
    NEXT_TELEMETRY_DISABLED: '1',
  },
  stdio: 'inherit',
  shell: true,
});
child.on('close', c => { console.log('EXIT', c); process.exit(c); });
