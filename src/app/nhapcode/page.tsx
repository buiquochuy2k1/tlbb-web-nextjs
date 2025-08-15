'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function NhapCodePage() {
  const [code, setCode] = useState('');
  const handleNhapCode = () => {
    console.log(code);
    toast.success('Tính năng đang cập nhật. Code: ' + code);
    setCode('');
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen   space-y-4">
      <h1 className="text-2xl font-bold">Nhập code</h1>
      <input
        type="text"
        className="border-2 border-gray-300 rounded-md p-2"
        placeholder="Nhập code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600  " onClick={handleNhapCode}>
        Nhập code
      </button>
    </div>
  );
}
