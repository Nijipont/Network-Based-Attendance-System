"use client"
import React, { useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { XCircle, CheckCircle } from 'lucide-react'; 
import { createClient } from '@/lib/supabase/client';

const passwordValidation = (password: string) => {
  return {
    isLengthValid: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}


export default function UpdatePassword() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // NEW STATE: For real-time requirement validation
    const [passwordRequirement, setPasswordRequirement] = useState(passwordValidation(''));
    // NEW STATE: For password matching status
    const [passwordMatching, setPasswordMatching] = useState(true); 


    const handleChange = (e) => {
        setMessage({ type: '', text: '' });
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newFormData = { ...prev, [name]: value };

            if (name === 'newPassword') {
                // 1. Requirement check
                const errors = passwordValidation(value);
                setPasswordRequirement(errors); 

                // 2. Match check
                const isMatching = prev.confirmPassword === value;
                setPasswordMatching(isMatching);
            } 
            
            else if (name === 'confirmPassword') {
                // 1. Match check
                const isMatching = prev.newPassword === value;
                setPasswordMatching(isMatching);
            }

            return newFormData;
        });
    }

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const { newPassword, confirmPassword } = formData;

        // Perform final validation checks
        const errors = passwordValidation(newPassword);
        const isRequirementValid = Object.values(errors).every(Boolean); 
        const isMatching = newPassword === confirmPassword; 
        
        setPasswordRequirement(errors); 
        setPasswordMatching(isMatching); 

        if (!isRequirementValid) {
            setMessage({ type: 'error', text: 'Password must meet all complexity requirements.' });
            setIsSubmitting(false);
            return;
        }
        
        if (!isMatching) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const supabase = createClient();
            
            // Supabase automatically detects the recovery token from the URL fragment (e.g., #access_token=...)
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                console.error("Supabase Update Password Error:", error);
                setMessage({ 
                    type: 'error', 
                    text: error.message || 'An error occurred while updating the password. Please try again.'
                });
            } else {
                setMessage({ 
                    type: 'success', 
                    text: 'Password successfully updated. Redirecting to login...'
                });
                // Redirect to login page after a short delay
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (error) {
            console.error("Catch Block Error:", error);
            setMessage({ 
                type: 'error', 
                text: 'Network or client error. Please try again.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [formData.newPassword, formData.confirmPassword, router]); 

    // Helper component to display requirements visually
    const RequirementItem = ({ isValid, children }) => (
        <li className={`flex items-center space-x-2 text-sm transition-colors ${isValid ? 'text-blue-600' : 'text-zinc-500'}`}>
            {isValid ? <CheckCircle size={14} className="text-blue-600" /> : <XCircle size={14} className="text-zinc-500" />}
            <span>{children}</span>
        </li>
    );


    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-300 font-sans text-zinc-900 p-4">
            <main className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all duration-300">
                <div className="space-y-6">

                    <div className="bg-zinc-50 p-6 rounded-xl shadow-inner">
                        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
                            Reset Your Password
                        </h2>
                        
                        <p className="text-center text-sm text-zinc-600 mb-6">
                            Enter your new password below.
                        </p>

                        {message.text && (
                            <div className={`p-4 rounded-xl text-sm mb-6 shadow-md ${
                                message.type === 'error' 
                                    ? 'bg-red-100 text-red-700 border border-red-300' 
                                    : 'bg-green-100 text-green-700 border border-green-300'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}> 
                            <div>
                                <label htmlFor="newPassword" className="block font-medium mb-1 text-zinc-700">New Password:</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword} 
                                    onChange={handleChange} 
                                    required
                                    placeholder="Enter your new password"
                                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition duration-150 ${
                                        !passwordMatching && formData.confirmPassword.length > 0 ? 'border-red-500 ring-red-500' : 'border-zinc-300 focus:ring-blue-500'
                                    }`}
                                />
                                {/* Password Requirement List */}
                                <ul className="mt-2 space-y-1 ml-1">
                                    <RequirementItem isValid={passwordRequirement.isLengthValid}>
                                        At least 8 characters
                                    </RequirementItem>
                                    <RequirementItem isValid={passwordRequirement.hasUppercase}>
                                        At least 1 uppercase letter (A-Z)
                                    </RequirementItem>
                                    <RequirementItem isValid={passwordRequirement.hasNumber}>
                                        At least 1 number (0-9)
                                    </RequirementItem>
                                </ul>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block font-medium mb-1 text-zinc-700">Confirm New Password:</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    required
                                    placeholder="Confirm your new password"
                                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition duration-150 ${
                                        !passwordMatching && formData.confirmPassword.length > 0 ? 'border-red-500 ring-red-500' : 'border-zinc-300 focus:ring-blue-500'
                                    }`}
                                />
                                {!passwordMatching && formData.confirmPassword.length > 0 && (
                                    <p className="text-sm text-red-500 mt-1 flex items-center space-x-1 ml-1">
                                        <XCircle size={14} /> <span>Passwords do not match.</span>
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting} 
                                className={`w-full py-3 rounded-lg font-semibold text-lg transition duration-300 transform hover:scale-[1.01] shadow-lg ${
                                    isSubmitting 
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
                                        Updating...
                                    </div>
                                ) : 'Update Password'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-sm text-zinc-500">
                        <span 
                            onClick={() => router.push('/')} 
                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition duration-150"
                        >
                            Back to Login
                        </span>
                    </p>
                </div>
            </main>
        </div>
    );
}