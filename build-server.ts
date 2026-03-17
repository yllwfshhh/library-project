import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/server.cjs',
  external: ['better-sqlite3', 'bcryptjs', 'express', 'vite', 'jsonwebtoken'],
}).catch(() => process.exit(1));
