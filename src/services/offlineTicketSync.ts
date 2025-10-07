// services/offlineTicketSync.ts
import NetInfo from '@react-native-community/netinfo';
import { firestore } from './firebase';
import { store } from '../store'; // Your Redux store
import {
  moveOfflineToSynced,
  updateTicketStatus,
  setSyncInProgress,
  removeOfflineTicket,
} from '../store/slice/ticketSlice';
import { ToastMessage } from '../constants/TostMessages';

class OfflineTicketSyncService {
  private unsubscribe: (() => void) | null = null;
  private isSyncing = false;


  start() {
    this.unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      
      if (isConnected && !this.isSyncing) {
        console.log('Network connected. Starting offline ticket sync...');
        this.syncOfflineTickets();
      }
    });
  }
  stop() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
  async syncOfflineTickets() {
    const state = store.getState();
    const offlineTickets = state.ticket.offlineTickets;

    if (offlineTickets.length === 0) {
      console.log('No offline tickets to sync');
      return;
    }

    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.isSyncing = true;
    store.dispatch(setSyncInProgress(true));

    console.log(`Starting sync for ${offlineTickets.length} offline tickets`);

    let successCount = 0;
    let failCount = 0;

    for (const ticket of offlineTickets) {
      try {
        store.dispatch(updateTicketStatus({ id: ticket.id, status: 'pending' }));

        // Prepare ticket data for Firestore
        const ticketData = {
          ...ticket,
          isOffline: false,
          syncStatus: 'synced',
          syncedAt: new Date().toISOString(),
        };

        await firestore()
          .collection('tickets')
          .doc(ticket.id)
          .set(ticketData);

        store.dispatch(moveOfflineToSynced(ticket.id));
        successCount++;

        console.log(`Successfully synced ticket: ${ticket.id}`);
      } catch (error) {
        console.error(`Failed to sync ticket ${ticket.id}:`, error);
        
        store.dispatch(updateTicketStatus({ id: ticket.id, status: 'failed' }));
        failCount++;
      }
    }

    this.isSyncing = false;
    store.dispatch(setSyncInProgress(false));

    if (successCount > 0) {
      ToastMessage.Custom(
        'success',
        'Sync Complete',
        `${successCount} ticket(s) synced successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
      );
    } else if (failCount > 0) {
      ToastMessage.Custom(
        'error',
        'Sync Failed',
        `Failed to sync ${failCount} ticket(s). Please try again.`
      );
    }

    console.log(`Sync complete: ${successCount} success, ${failCount} failed`);
  }

  async retryFailedTickets() {
    const state = store.getState();
    const failedTickets = state.ticket.offlineTickets.filter(
      t => t.status === 'failed'
    );

    if (failedTickets.length === 0) {
      ToastMessage.Custom('info', 'No failed tickets to retry');
      return;
    }

    console.log(`Retrying ${failedTickets.length} failed tickets`);
    await this.syncOfflineTickets();
  }

  getSyncStatus() {
    const state = store.getState();
    return {
      isSyncing: state.ticket.syncInProgress,
      offlineCount: state.ticket.offlineTickets.length,
      failedCount: state.ticket.offlineTickets.filter(t => t.status === 'failed').length,
    };
  }
}


export const offlineTicketSync = new OfflineTicketSyncService();