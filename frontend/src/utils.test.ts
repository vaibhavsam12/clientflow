import { describe, it, expect } from 'vitest';
import { getStatusConfig, getPriorityConfig, formatBytes, formatCurrency } from './utils/formatters';

describe('Frontend Formatter & Helper Tests', () => {
  it('should correctly configure status badges', () => {
    expect(getStatusConfig('ACTIVE').label).toBe('Active');
    expect(getStatusConfig('TODO').label).toBe('To Do');
    expect(getStatusConfig('IN_PROGRESS').label).toBe('In Progress');
    expect(getStatusConfig('DONE').label).toBe('Done');
  });

  it('should correctly configure priority badges', () => {
    expect(getPriorityConfig('URGENT').label).toBe('Urgent');
    expect(getPriorityConfig('HIGH').label).toBe('High');
    expect(getPriorityConfig('MEDIUM').label).toBe('Medium');
    expect(getPriorityConfig('LOW').label).toBe('Low');
  });

  it('should format file sizes cleanly', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('should format currency accurately', () => {
    expect(formatCurrency(125000)).toBe('$125,000');
    expect(formatCurrency(null)).toBe('—');
  });
});
