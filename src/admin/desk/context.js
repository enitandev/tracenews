import { createContext, useContext } from 'react';

/** The Desk summary (/api/admin/desk) shared by the shell rail and every screen. */
export const DeskContext = createContext({ summary: null, refresh: () => {}, profile: null });
export const useDesk = () => useContext(DeskContext);
