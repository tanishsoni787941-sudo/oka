import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Ban, LogOut } from 'lucide-react';

const Blocked = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <Ban className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Your account has been blocked by admin.
        </p>
        <button
          onClick={signOut}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Blocked;
