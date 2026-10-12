import { createProfile, saveProfile } from '@vitapact/core/storage';
import { openTestDatabase, sampleProfile } from '@vitapact/core/storage/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLocalData } from './useLocalData';

describe('A1 local data', () => {
  it('opens the database once and reads the profile', async () => {
    const db = await openTestDatabase();
    await saveProfile(db, sampleProfile);
    let opened = 0;
    const openDatabase = () => {
      opened += 1;
      return Promise.resolve(db);
    };
    const { result } = renderHook(() => useLocalData(openDatabase));

    await waitFor(() => expect(result.current.data.status).toBe('ready'));
    expect(result.current.data).toMatchObject({ profile: { nickname: 'Rei' } });
    expect(result.current.data.status === 'ready' && result.current.data.db).toBe(db);
    expect(opened).toBe(1);
  });

  it('RF-01 picks up the profile that onboarding has just created', async () => {
    const db = await openTestDatabase();
    const openDatabase = () => Promise.resolve(db);
    const { result } = renderHook(() => useLocalData(openDatabase));
    await waitFor(() => expect(result.current.data).toMatchObject({ profile: undefined }));

    await createProfile(db, { nickname: 'Sam', createdAt: '2026-10-12T08:00:00.000Z' });
    await act(() => result.current.reloadProfile());

    expect(result.current.data).toMatchObject({ profile: { nickname: 'Sam' } });
  });

  it('reports the database as unavailable when it cannot be opened', async () => {
    const openDatabase = () => Promise.reject(new Error('blocked'));
    const { result } = renderHook(() => useLocalData(openDatabase));

    await waitFor(() => expect(result.current.data.status).toBe('unavailable'));
  });
});
