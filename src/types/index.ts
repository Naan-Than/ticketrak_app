export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'agent' | 'admin';
};

export type Reply = {
  id: string;
  author: User;
  type: 'reply' | 'private';
  content: string;
  createdAt?: any; // Firestore timestamp
};

export type Ticket = {
  id?: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt?: any;
  updatedAt?: any;
  createdBy: User;
  assignedTo?: User | null;
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  attachments?: string[];
  conversation?: Reply[];
};
