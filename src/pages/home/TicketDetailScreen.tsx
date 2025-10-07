import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp, getFirestore } from 'firebase/firestore';
import {
  setCurrentTicket,
  setLoading,
  setError,
  loadCachedTicket,
  addConversationItem,
  updateTicketStatus as updateStatusAction,
  setSavingReply,
  setSavingNote,
  setUpdatingStatus,
  updateConversationItemSyncStatus,
  TicketDetail,
  ConversationItem,
} from '../../store/slice/ticketDetailSlice';
import { firestore } from '../../services/firebase';
import { ToastMessage } from '../../constants/TostMessages';


const TicketDetailScreen: React.FC = (props: any) => {
  const { ticketId } = props.route.params;
  const dispatch = useDispatch();
  const userData = useSelector((state: any) => state.auth.userData);
  const { currentTicket, loading, error, savingReply, savingNote, updatingStatus } = useSelector(
    (state: any) => state.ticketDetail
  );
  const userRole = useSelector((state: any) => state.auth.userRole);

  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState<'reply' | 'note'>('reply');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    dispatch(loadCachedTicket(ticketId));
    fetchTicketDetail();
  }, [ticketId]);

  const fetchTicketDetail = async () => {
    try {
      dispatch(setLoading(true));

      const docRef = await firestore().collection('tickets').doc(ticketId).get();
      if (docRef.exists()) {
        const data = docRef.data();
        let conversation = data?.conversation || [];
        if (
          userRole === 'Admin' &&
          data?.assignedUser?.uid !== userData?.uid
        ) {
          conversation = conversation.filter(
            (item: any) => item.type === 'reply'
          );
        }
        const ticket: TicketDetail = {
          id: docRef.id,
          ...data,
          conversation,
        } as TicketDetail;
        dispatch(setCurrentTicket(ticket));
      } else {
        dispatch(setError('Ticket not found'));
      }
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim() || !currentTicket) return;

    const newReply: ConversationItem = {
      id: Date.now().toString(),
      type: 'reply',
      content: replyText.trim(),
      createdBy: userData?.uid || '',
      createdByName: userData?.displayName || 'You',
      createdAt: new Date().toISOString(),
      isOffline: true,
      syncStatus: 'pending',
    };

    dispatch(addConversationItem(newReply));
    setReplyText('');

    try {
      dispatch(setSavingReply(true));
      const docRef = firestore().collection('tickets').doc(ticketId);

      await docRef.update({
        conversation: firestore.FieldValue.arrayUnion({
          ...newReply,
          createdAt: new Date().toISOString(),
          isOffline: false, syncStatus: 'synced',
        }),
        updatedAt: new Date().toISOString(),
      });

      dispatch(updateConversationItemSyncStatus({ id: newReply.id, syncStatus: 'synced' }));
      scrollToBottom();
    } catch (err: any) {
      dispatch(updateConversationItemSyncStatus({ id: newReply.id, syncStatus: 'failed' }));
      Alert.alert('Error', 'Failed to send reply. It will be synced when online.');
    } finally {
      dispatch(setSavingReply(false));
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !currentTicket) return;

    const newNote: ConversationItem = {
      id: Date.now().toString(),
      type: 'note',
      content: noteText.trim(),
      createdBy: userData?.uid || '',
      createdByName: userData?.displayName || 'You',
      createdAt: new Date().toISOString(),
      isOffline: true,
      syncStatus: 'pending',
    };

    dispatch(addConversationItem(newNote));
    setNoteText('');
    try {
      dispatch(setSavingNote(true));
      const docRef = firestore().collection('tickets').doc(ticketId);
      await docRef.update({
        conversation: firestore.FieldValue.arrayUnion({
          ...newNote,
          createdAt: new Date().toISOString(),
          isOffline: false, syncStatus: 'synced'
        }),
        updatedAt: new Date().toISOString(),
      });

      dispatch(updateConversationItemSyncStatus({ id: newNote.id, syncStatus: 'synced' }));
      scrollToBottom();
    } catch (err: any) {
      console.log(err, '////////////////');
      dispatch(updateConversationItemSyncStatus({ id: newNote.id, syncStatus: 'failed' }));
      Alert.alert('Error', 'Failed to add note. It will be synced when online.');
    } finally {
      dispatch(setSavingNote(false));
    }
  };

  const handleStatusChange = async (newStatus: 'open' | 'pending' | 'closed') => {
    if (!currentTicket) return;
    try {
      dispatch(setUpdatingStatus(true));
      const docRef = firestore().collection('tickets').doc(ticketId);
      await docRef.update({
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      dispatch(updateStatusAction(newStatus));
      ToastMessage.Custom('success', 'Status updated successfully')
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update status');
      ToastMessage.Custom('error', 'Failed to update status')
    } finally {
      dispatch(setUpdatingStatus(false));
    }
  };


  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

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
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !currentTicket) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (error && !currentTicket) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTicketDetail}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentTicket) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.scrollView} ref={scrollViewRef}>
        {/* Ticket Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.ticketId}>#{currentTicket.id.slice(0, 8)}</Text>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: getStatusColor(currentTicket.status) }]}>
                <Text style={styles.badgeText}>{currentTicket.status.toUpperCase()}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getPriorityColor(currentTicket.priority) }]}>
                <Text style={styles.badgeText}>{currentTicket.priority.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.title}>{currentTicket.title}</Text>
          <Text style={styles.dateText}>
            Created: {formatDate(currentTicket.createdDate)} • Updated: {formatDate(currentTicket.updatedDate)}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{currentTicket.description}</Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Name:</Text>
              <Text style={styles.contactValue}>{currentTicket.contactInfo.name}</Text>
            </View>
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Email:</Text>
              <Text style={styles.contactValue}>{currentTicket.contactInfo.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Phone:</Text>
              <Text style={styles.contactValue}>{currentTicket.contactInfo.phone}</Text>
            </View>
          </View>
        </View>
        {userRole === 'Admin' &&
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned User</Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Name:</Text>
                <Text style={styles.contactValue}>{currentTicket.assignedUser.name}</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Email:</Text>
                <Text style={styles.contactValue}>{currentTicket.assignedUser.email}</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Phone:</Text>
                <Text style={styles.contactValue}>{currentTicket.assignedUser.phone}</Text>
              </View>
            </View>
          </View>}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Status</Text>
          <View style={styles.statusButtons}>
            {['open', 'pending', 'closed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  currentTicket.status === status && styles.statusButtonActive,
                ]}
                onPress={() => handleStatusChange(status as any)}
                disabled={updatingStatus || currentTicket.status === status}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    currentTicket.status === status && styles.statusButtonTextActive,
                  ]}
                >
                  {status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Conversation History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversation History</Text>
          {currentTicket.conversation.length === 0 ? (
            <Text style={styles.noConversation}>No replies or notes yet</Text>
          ) : (
            <View style={styles.conversationList}>
              {currentTicket.conversation.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.conversationItem,
                    item.type === 'note' && styles.conversationItemNote,
                  ]}
                >
                  <View style={styles.conversationHeader}>
                    <View style={styles.conversationHeaderLeft}>
                      <Text style={styles.conversationAuthor}>{item.createdByName}</Text>
                      <View
                        style={[
                          styles.conversationTypeBadge,
                          item.type === 'note' && styles.conversationTypeBadgeNote,
                        ]}
                      >
                        <Text style={styles.conversationTypeText}>
                          {item.type === 'reply' ? 'REPLY' : 'NOTE'}
                        </Text>
                      </View>
                    </View>
                    {item.syncStatus === 'pending' && (
                      <ActivityIndicator size="small" color="#FFD700" />
                    )}
                    {item.syncStatus === 'failed' && (
                      <Text style={styles.syncFailed}>Failed</Text>
                    )}
                  </View>
                  <Text style={styles.conversationContent}>{item.content}</Text>
                  <Text style={styles.conversationDate}>{formatDate(item.createdAt)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        {currentTicket?.assignedUser?.uid === userData?.uid && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reply' && styles.tabActive]}
              onPress={() => setActiveTab('reply')}
            >
              <Text style={[styles.tabText, activeTab === 'reply' && styles.tabTextActive]}>
                Reply to Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'note' && styles.tabActive]}
              onPress={() => setActiveTab('note')}
            >
              <Text style={[styles.tabText, activeTab === 'note' && styles.tabTextActive]}>
                Private Note
              </Text>
            </TouchableOpacity>
          </View>)}

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={
              activeTab === 'reply'
                ? 'Type your reply to the customer...'
                : 'Add a private note (internal only)...'
            }
            placeholderTextColor="#999"
            multiline
            value={activeTab === 'reply' ? replyText : noteText}
            onChangeText={activeTab === 'reply' ? setReplyText : setNoteText}
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (activeTab === 'reply' ? !replyText.trim() : !noteText.trim()) &&
              styles.sendButtonDisabled,
            ]}
            onPress={activeTab === 'reply' ? handleAddReply : handleAddNote}
            disabled={
              (activeTab === 'reply' ? !replyText.trim() || savingReply : !noteText.trim() || savingNote)
            }
          >
            {(activeTab === 'reply' ? savingReply : savingNote) ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
  header: {
    backgroundColor: '#FFD700',
    padding: 20,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketId: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#333',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  contactInfo: {
    gap: 10,
  },
  contactRow: {
    flexDirection: 'row',
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    width: 70,
  },
  contactValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#FFD700',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  statusButtonTextActive: {
    color: '#000',
  },
  noConversation: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  conversationList: {
    gap: 12,
  },
  conversationItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  conversationItemNote: {
    backgroundColor: '#FFF8DC',
    borderLeftColor: '#FF9800',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conversationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conversationAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  conversationTypeBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conversationTypeBadgeNote: {
    backgroundColor: '#FF9800',
  },
  conversationTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  syncFailed: {
    fontSize: 11,
    color: '#F44336',
    fontWeight: '600',
  },
  conversationContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6,
  },
  conversationDate: {
    fontSize: 12,
    color: '#666',
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FFD700',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#000',
  },
  inputWrapper: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#FFD700',
    width: 70,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default TicketDetailScreen;