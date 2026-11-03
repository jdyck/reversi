import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';
import type { NextConfig } from 'next';

// Keep development output separate from production builds so either command can
// run without replacing files used by the other server.
export default function config(phase: string): NextConfig {
  return { distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next' };
}
