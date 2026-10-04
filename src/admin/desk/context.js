import { createContext, useContext } from 'react';

/**
 * Shared by the shell and every screen: the Desk summary (/api/admin/desk),
 * the signed-in profile, and the editor's notifications (useNotifications).
 */
const NO_NOTES = { items: null, counts: null, error: null, reload: () => {}, markRead: () => {},
  browserAlerts: false, setBrowserAlerts: () => null };
export const DeskContext = createContext({ summary: null, refresh: () => {}, profile: null, notes: NO_NOTES });
export const useDesk = () => useContext(DeskContext);
