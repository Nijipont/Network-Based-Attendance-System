"use client"
import React, { useState, useCallback } from "react";
import { useRouter } from 'next/navigation'; 
import { createClient } from '../lib/supabase/client'; 

export default function Home() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setMessage({ type: '', text: '' });
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        
        if (!formData.email || !formData.password) {
            setMessage({ type: 'error', text: 'Please enter both email and password.' });
            setIsSubmitting(false);
            return;
        }

        const supabase = createClient();

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                throw error;
            }

            setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
            
            setTimeout(() => {
                window.location.href = '/';
            }, 1000); 

        } catch (error) {
            console.error('Login Error:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Invalid login credentials.' 
            });
            setIsSubmitting(false);
        } finally {
            if (message.type !== 'success') {
                setIsSubmitting(false);
            }
        }
    }, [formData, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-300 font-sans text-zinc-900 p-4">
            <main className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-center">Welcome to <span className="text-blue-600">Location Attend</span></h1>

                    <div className="bg-zinc-50 p-6 rounded-xl shadow-inner">
                        <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
                        
                        {message.text && (
                            <div className={`p-3 rounded-lg text-sm mb-4 ${
                                message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}> 
                            <div>
                                <label htmlFor="email" className="block font-medium mb-1">Email:</label>
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required
                                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block font-medium mb-1">Password:</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required
                                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting} 
                                className={`w-full py-2 rounded-lg font-medium transition ${
                                    isSubmitting 
                                        ? 'bg-blue-400 cursor-not-allowed text-white' 
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {isSubmitting ? 'Logging In...' : 'Login'}
                            </button>

                            <div className="text-center mt-2">
                                <a href="/register" className="text-blue-600 hover:underline">Register</a>
                            </div>
                            <div className="text-center mt-2">
                                <a href="/reset-password" className="text-blue-600 hover:underline">Forget Password</a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}