"use client";
import { createClient } from '@/lib/supabase/client'; // ใช้ Client Client สำหรับ signOut
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';


export default function ClientLogoutButton() {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient(); 

    const handleLogout = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout Error:', error);
            alert('Logout Error:' + error.message);
            setIsLoading(false);
            return;
        }

        window.location.href = '/'; 
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`text-sm font-semibold transition duration-200 p-2 rounded-lg 
                       ${isLoading 
                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                         : 'bg-red-500 text-white hover:bg-red-600'
                       }`}
        >
            {isLoading ? 'Loging out...' : 'Logout'}
        </button>
    );
}