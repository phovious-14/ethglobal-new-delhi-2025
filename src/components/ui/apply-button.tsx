'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Twitter } from 'lucide-react';

export default function ApplyButton() {
  const [isApplied, setIsApplied] = useState(false);

  return (
    <Button
      onClick={() => setIsApplied(!isApplied)}
      className={`${
        isApplied 
          ? 'bg-green-500 hover:bg-green-600' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
      } px-8 py-4 rounded-2xl font-medium transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105`}
    >
      <Twitter className="w-5 h-5 mr-3" />
      {isApplied ? 'Application Submitted' : 'Apply for Campaign'}
    </Button>
  );
} 