"use client"
import React, { useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Resetpassword() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
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

        // Simple validation
        if (!formData.email) {
            setMessage({ type: 'error', text: 'Please enter your email address.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const supabase = createClient();

            const redirectToUrl = `${window.location.origin}/update-password`;

            const { error } = await supabase.auth.resetPasswordForEmail(
                formData.email,
                {
                    redirectTo: redirectToUrl,
                }
            );

            if (error) {
                console.error("Supabase Reset Error:", error);
                setMessage({
                    type: 'error',
                    text: error.message || 'An unexpected error occurred during reset request.'
                });
            } else {
                setMessage({
                    type: 'success',
                    text: `A password reset link has been sent to ${formData.email}. Please check your inbox and spam folder.`
                });
                setFormData({ email: '' });
            }
        } catch (error) {
            console.error("Catch Block Error:", error);
            setMessage({
                type: 'error',
                text: 'Network error or client issue. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [formData.email]); // Dependency on email ensures we use the latest value

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-300 font-sans text-zinc-900 p-4">
            <main className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all duration-300">
                <div className="space-y-6">

                    <div className="bg-zinc-50 p-6 rounded-xl shadow-inner">
                        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
                            Forget Password
                        </h2>

                        <p className="text-center text-sm text-zinc-600 mb-6">
                            Enter the email associated with your account and we'll send you a link to reset your password.
                        </p>

                        {message.text && (
                            <div className={`p-4 rounded-xl text-sm mb-6 shadow-md ${message.type === 'error'
                                    ? 'bg-red-100 text-red-700 border border-red-300'
                                    : 'bg-green-100 text-green-700 border border-green-300'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block font-medium mb-1 text-zinc-700">Email Address:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full border border-zinc-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-lg font-semibold text-lg transition duration-300 transform hover:scale-[1.01] shadow-lg ${isSubmitting
                                        ? 'bg-blue-400 cursor-not-allowed text-white'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending Link...
                                    </div>
                                ) : 'Send Reset Link'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-sm text-zinc-500">
                        Remembered your password?
                        <a
                            onClick={() => router.push('/')}
                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer ml-1 transition duration-150"
                        >
                            Log In
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
}