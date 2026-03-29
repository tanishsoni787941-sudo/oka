import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { CheckCircle, Circle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: any;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleToggleRead = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'messages', id), {
        status: currentStatus === 'read' ? 'unread' : 'read'
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {messages.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">No messages found.</li>
          ) : (
            messages.map((msg) => (
              <li key={msg.id} className={msg.status === 'unread' ? 'bg-indigo-50/30' : ''}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className={`text-sm font-medium truncate ${msg.status === 'unread' ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {msg.name}
                      </p>
                      <span className="mx-2 text-gray-300">•</span>
                      <p className="text-sm text-gray-500 truncate">{msg.email}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'MMM d, yyyy h:mm a') : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-700 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm sm:mt-0 space-x-4">
                      <button
                        onClick={() => handleToggleRead(msg.id, msg.status)}
                        className={`flex items-center ${msg.status === 'unread' ? 'text-indigo-600 hover:text-indigo-900' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {msg.status === 'unread' ? (
                          <><Circle className="w-4 h-4 mr-1" /> Mark Read</>
                        ) : (
                          <><CheckCircle className="w-4 h-4 mr-1" /> Mark Unread</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="flex items-center text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminMessages;
