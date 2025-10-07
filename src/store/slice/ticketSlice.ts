import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  status: 'pending' | 'synced' | 'failed';
  createdAt: string;
  createdBy: string;
  isOffline: boolean;
}

interface TicketState {
  tickets: Ticket[];
  offlineTickets: Ticket[];
  syncInProgress: boolean;
}

const initialState: TicketState = {
  tickets: [],
  offlineTickets: [],
  syncInProgress: false,
};

export const ticketSlice = createSlice({
  name: 'ticket',
  initialState: initialState,
  reducers: {
    addTicket: (state, action: PayloadAction<Ticket>) => {
      state.tickets.push(action.payload);
    },
    
    addOfflineTicket: (state, action: PayloadAction<Ticket>) => {
      state.offlineTickets.push(action.payload);
    },
    
    removeOfflineTicket: (state, action: PayloadAction<string>) => {
      state.offlineTickets = state.offlineTickets.filter(
        ticket => ticket.id !== action.payload
      );
    },
    
    updateTicketStatus: (state, action: PayloadAction<{ id: string; status: 'pending' | 'synced' | 'failed' }>) => {
      const ticket = state.offlineTickets.find(t => t.id === action.payload.id);
      if (ticket) {
        ticket.status = action.payload.status;
      }
    },
    
    setSyncInProgress: (state, action: PayloadAction<boolean>) => {
      state.syncInProgress = action.payload;
    },
    
    moveOfflineToSynced: (state, action: PayloadAction<string>) => {
      const offlineTicket = state.offlineTickets.find(t => t.id === action.payload);
      if (offlineTicket) {
        state.tickets.push({ ...offlineTicket, isOffline: false, status: 'synced' });
        state.offlineTickets = state.offlineTickets.filter(t => t.id !== action.payload);
      }
    },
    
    clearAllTickets: (state) => {
      state.tickets = [];
      state.offlineTickets = [];
      state.syncInProgress = false;
    },
  },
});

export const {
  addTicket,
  addOfflineTicket,
  removeOfflineTicket,
  updateTicketStatus,
  setSyncInProgress,
  moveOfflineToSynced,
  clearAllTickets,
} = ticketSlice.actions;

export default ticketSlice.reducer;