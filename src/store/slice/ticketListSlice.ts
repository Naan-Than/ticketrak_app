import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TicketListItem {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  createdBy: string;
}

export interface FilterState {
  status: ('open' | 'pending' | 'closed')[];
  priority: ('low' | 'medium' | 'high' | 'urgent')[];
  dateFrom: string | null;
  dateTo: string | null;
  searchQuery: string;
}

interface TicketListState {
  tickets: TicketListItem[];
  cachedTickets: TicketListItem[];
  filters: FilterState;
  loading: boolean;
  error: string | null;
}

const initialState: TicketListState = {
  tickets: [],
  cachedTickets: [],
  filters: {
    status: [],
    priority: [],
    dateFrom: null,
    dateTo: null,
    searchQuery: '',
  },
  loading: false,
  error: null,
};

export const ticketListSlice = createSlice({
  name: 'ticketList',
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<TicketListItem[]>) => {
      state.tickets = action.payload;
      state.cachedTickets = action.payload;
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
    
    updateFilter: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    
    updateTicket: (state, action: PayloadAction<TicketListItem>) => {
      const index = state.tickets.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
      const cachedIndex = state.cachedTickets.findIndex(t => t.id === action.payload.id);
      if (cachedIndex !== -1) {
        state.cachedTickets[cachedIndex] = action.payload;
      }
    },
    
    loadCachedTickets: (state) => {
      state.tickets = state.cachedTickets;
    },
  },
});

export const {
  setTickets,
  setLoading,
  setError,
  updateFilter,
  clearFilters,
  setSearchQuery,
  updateTicket,
  loadCachedTickets,
} = ticketListSlice.actions;

export default ticketListSlice.reducer;