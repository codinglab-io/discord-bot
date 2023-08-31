export const getCronTime = (cron: string): string => {
  switch (cron) {
    case 'day':
      return '0 0 9 * * *';
    case 'week':
      return '0 0 9 * * 0';
    case 'month':
      return '0 0 9 1 * *';
    default:
      throw new Error('Unknown cron time');
  }
};
