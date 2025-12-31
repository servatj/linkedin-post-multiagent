import { logSection, logToolCall, logToolResult, logAgentStart, logAgentEnd } from '../../utils/logger';

describe('Logger utilities', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should log section headers', () => {
    logSection('TEST SECTION');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should log tool calls', () => {
    logToolCall('test_tool', { param: 'value' });
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should log tool results', () => {
    logToolResult('test_tool', 'success');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should log agent start events', () => {
    logAgentStart('Test Agent', 'test input');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should log agent end events', () => {
    logAgentEnd('Test Agent', 'test output');
    expect(consoleSpy).toHaveBeenCalled();
  });
});
