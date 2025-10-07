import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ConversationItem {
  id: string;
  type: 'reply' | 'note';
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  isOffline?: boolean;
  syncStatus?: 'pending' | 'synced' | 'failed';
}

export interface TicketDetail {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contactInfo: ContactInfo;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  conversation: ConversationItem[];
}

interface TicketDetailState {
  currentTicket: TicketDetail | null;
  cachedTickets: { [key: string]: TicketDetail };
  loading: boolean;
  error: string | null;
  savingReply: boolean;
  savingNote: boolean;
  updatingStatus: boolean;
}

const initialState: TicketDetailState = {
  currentTicket: null,
  cachedTickets: {},
  loading: false,
  error: null,
  savingReply: false,
  savingNote: false,
  updatingStatus: false,
};

export const ticketDetailSlice = createSlice({
  name: 'ticketDetail',
  initialState,
  reducers: {
    setCurrentTicket: (state, action: PayloadAction<TicketDetail>) => {
      state.currentTicket = action.payload;
      state.cachedTickets[action.payload.id] = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    loadCachedTicket: (state, action: PayloadAction<string>) => {
      const cached = state.cachedTickets[action.payload];
      if (cached) {
        state.currentTicket = cached;
      }
    },
    
    addConversationItem: (state, action: PayloadAction<ConversationItem>) => {
      if (state.currentTicket) {
        state.currentTicket.conversation.push(action.payload);
        state.cachedTickets[state.currentTicket.id] = state.currentTicket;
      }
    },
    
    updateTicketStatus: (state, action: PayloadAction<'open' | 'pending' | 'closed'>) => {
      if (state.currentTicket) {
        state.currentTicket.status = action.payload;
        state.currentTicket.updatedAt = new Date().toISOString();
        state.cachedTickets[state.currentTicket.id] = state.currentTicket;
      }
      state.updatingStatus = false;
    },
    
    setSavingReply: (state, action: PayloadAction<boolean>) => {
      state.savingReply = action.payload;
    },
    
    setSavingNote: (state, action: PayloadAction<boolean>) => {
      state.savingNote = action.payload;
    },
    
    setUpdatingStatus: (state, action: PayloadAction<boolean>) => {
      state.updatingStatus = action.payload;
    },
    
    updateConversationItemSyncStatus: (
      state,
      action: PayloadAction<{ id: string; syncStatus: 'pending' | 'synced' | 'failed' }>
    ) => {
      if (state.currentTicket) {
        const item = state.currentTicket.conversation.find(c => c.id === action.payload.id);
        if (item) {
          item.syncStatus = action.payload.syncStatus;
          state.cachedTickets[state.currentTicket.id] = state.currentTicket;
        }
      }
    },
    
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
      state.error = null;
    },
  },
});

export const {
  setCurrentTicket,
  setLoading,
  setError,
  loadCachedTicket,
  addConversationItem,
  updateTicketStatus,
  setSavingReply,
  setSavingNote,
  setUpdatingStatus,
  updateConversationItemSyncStatus,
  clearCurrentTicket,
} = ticketDetailSlice.actions;

export default ticketDetailSlice.reducer;