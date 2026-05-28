import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(__dirname, '../../../server.log');

export const logEvent = (event: string, details?: string) => {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${event}${details ? ' | ' + details : ''}\n`;
  fs.appendFileSync(LOG_FILE, message);
};
