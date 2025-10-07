import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  setTickets,
  setLoading,
  setError,
  setSearchQuery,
  updateFilter,
  clearFilters,
  loadCachedTickets,
  TicketListItem,
  FilterState,
} from '../../store/slice/ticketListSlice'
import { firestore } from '../../services/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';
import { useIsFocused } from '@react-navigation/native';

const TicketListScreen = (props:any) => {
  const dispatch = useDispatch();
  const userData = useSelector((state: any) => state.auth.userData);
  const userRole = useSelector((state: any) => state.auth.userRole);
  const { tickets, filters, loading, error, cachedTickets } = useSelector(
    (state: any) => state.ticketList
  );

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const isFocuesd = useIsFocused();


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    if (cachedTickets.length > 0) {
      dispatch(loadCachedTickets());
    }
    fetchTickets();
    return () => unsubscribe();
  }, [isFocuesd]);

const fetchTickets = async () => {
  try {
    dispatch(setLoading(true));

    let ticketsList: TicketListItem[] = [];

    if (userRole === 'Admin') {
      const snapshot = await firestore().collection('tickets').get();
      ticketsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TicketListItem[];
    } else {
      const [assignedSnap, createdSnap] = await Promise.all([
        firestore()
          .collection('tickets')
          .where('assignedUser.uid', '==', userData.uid)
          .get(),

        firestore()
          .collection('tickets')
          .where('createdBy.uid', '==', userData.uid)
          .get(),
      ]);

      const seen = new Set();
      const allDocs = [...assignedSnap.docs, ...createdSnap.docs];

      ticketsList = allDocs
        .filter(doc => {
          if (seen.has(doc.id)) return false;
          seen.add(doc.id);
          return true;
        })
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TicketListItem[];
    }

    dispatch(setTickets(ticketsList));
  } catch (err: any) {
    console.error('Error fetching tickets:', err);
    dispatch(setError(err.message));
    dispatch(loadCachedTickets());
  } finally {
    dispatch(setLoading(false));
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      result = result.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status.length > 0) {
      result = result.filter((ticket) => filters.status.includes(ticket.status));
    }

    if (filters.priority.length > 0) {
      result = result.filter((ticket) => filters.priority.includes(ticket.priority));
    }

    if (filters.dateFrom) {
      result = result.filter((ticket) => new Date(ticket.createdAt) >= new Date(filters.dateFrom!));
    }

    if (filters.dateTo) {
      result = result.filter((ticket) => new Date(ticket.createdAt) <= new Date(filters.dateTo!));
    }

    return result;
  }, [tickets, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'closed': return '#9E9E9E';
      default: return '#FFD700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#F44336';
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#FFD700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTicketItem = ({ item }: { item: TicketListItem }) => (
    <TouchableOpacity style={styles.ticketCard} onPress={()=>{props.navigation.navigate('TicketDetail', { ticketId: item.id })}}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketId}>#{item.id.slice(0, 8)}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.badgeText}>{item.priority.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.ticketTitle}>{item.title}</Text>
      <Text style={styles.ticketDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.ticketFooter}>
        <Text style={styles.dateText}>Created: {formatDate(item.createdDate)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{userRole === 'Admin' ? 'All Tickets' : 'My Tickets'}</Text>
        <Text style={styles.headerSubtitle}>{filteredTickets.length} tickets</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tickets..."
          placeholderTextColor="#999"
          value={filters.searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {loading && cachedTickets.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : error && cachedTickets.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTickets}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {!isOnline && (
            <View style={styles.offlineBanner}>
              <Icon name="cloud-off" size={20} color="#F57C00" style={{ marginRight: 8 }} />
              <Text style={styles.offlineBannerText}>You are offline</Text>
            </View>
          )}
          <FlatList
            data={filteredTickets}
            renderItem={renderTicketItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#FFD700']}
                tintColor="#FFD700"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="folder-open" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No tickets found</Text>
              </View>
            }
          />
        </>
      )}

      <FilterBottomSheet
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApply={(newFilters) => {
          dispatch(updateFilter(newFilters));
          setFilterModalVisible(false);
        }}
        onClear={() => {
          dispatch(clearFilters());
          setFilterModalVisible(false);
        }}
      />
    </View>
  );
};

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: Partial<FilterState>) => void;
  onClear: () => void;
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onClear,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleStatus = (status: 'open' | 'pending' | 'closed') => {
    const newStatuses = localFilters.status.includes(status)
      ? localFilters.status.filter(s => s !== status)
      : [...localFilters.status, status];
    setLocalFilters({ ...localFilters, status: newStatuses });
  };

  const togglePriority = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const newPriorities = localFilters.priority.includes(priority)
      ? localFilters.priority.filter(p => p !== priority)
      : [...localFilters.priority, priority];
    setLocalFilters({ ...localFilters, priority: newPriorities });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Tickets</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.filterOptions}>
              {['open', 'pending', 'closed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    localFilters.status.includes(status as any) && styles.filterChipActive,
                  ]}
                  onPress={() => toggleStatus(status as any)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      localFilters.status.includes(status as any) && styles.filterChipTextActive,
                    ]}
                  >
                    {status.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Priority</Text>
            <View style={styles.filterOptions}>
              {['low', 'medium', 'high', 'urgent'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.filterChip,
                    localFilters.priority.includes(priority as any) && styles.filterChipActive,
                  ]}
                  onPress={() => togglePriority(priority as any)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      localFilters.priority.includes(priority as any) && styles.filterChipTextActive,
                    ]}
                  >
                    {priority.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={onClear}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.applyButton]}
              onPress={() => onApply(localFilters)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFD700',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  filterButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketId: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: '#FFF',
  },
  filterChipActive: {
    backgroundColor: '#FFD700',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  filterChipTextActive: {
    color: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  clearButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#FFD700',
  },
  applyButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: '#FFF3E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  offlineBannerText: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TicketListScreen;