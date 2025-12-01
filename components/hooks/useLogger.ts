const DEBUG = process.env.NODE_ENV === 'development';

export const log = (...args: any[]) => {
  if (DEBUG) console.log('[chat]', ...args);
};
