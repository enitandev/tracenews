import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchJSON } from './fetchJSON';

const reply = (status, body = {}) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

describe('fetchJSON', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

  it('retries a server error once, then returns the data', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const f = vi.fn().mockReturnValueOnce(reply(500)).mockReturnValueOnce(reply(200, { clusters: [1] }));
    vi.stubGlobal('fetch', f);
    await expect(fetchJSON('/x')).resolves.toEqual({ clusters: [1] });
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('does not retry a 404', async () => {
    const f = vi.fn().mockReturnValue(reply(404));
    vi.stubGlobal('fetch', f);
    await expect(fetchJSON('/x')).rejects.toThrow('HTTP 404');
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('gives up after the retry', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const f = vi.fn().mockReturnValue(reply(502));
    vi.stubGlobal('fetch', f);
    await expect(fetchJSON('/x')).rejects.toThrow('HTTP 502');
    expect(f).toHaveBeenCalledTimes(2);
  });
});
