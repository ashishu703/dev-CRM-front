import React from 'react';
import { AlertCircle } from 'lucide-react';

const FunctionUpcoming = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Function Upcoming</h2>
        <p className="text-gray-600 text-lg">
          This function is currently under development and will be available soon.
        </p>
      </div>
    </div>
  );
};

export default FunctionUpcoming;

