"use client"
import React, { useState, useCallback } from "react";
import { XCircle, CheckCircle } from 'lucide-react'; 
import { createClient } from '@/lib/supabase/client';

export function passwordValidation(password: string) {
  return {
    isLengthValid: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

export default function Register() {
  const TEACHER_DOMAIN = 'kku.ac.th';
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // State 1: Validation errors for password requirements (stores the object {isLengthValid: bool, ...})
  const [passwordRequirement, setPasswordRequirment] = useState(passwordValidation(''));
  
  // State 2: Boolean flag for password matching (true if they match, false otherwise)
  const [passwordMatching, setPasswordMatching] = useState(true); 
  
  // State 3: To display general success/error messages (replaces alert())
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setMessage({ type: '', text: '' }); // Clear message on change
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };

      if (name === 'password') {
        const errors = passwordValidation(value);
        setPasswordRequirment(errors); 

        // Match check: Compare new password (value) with old confirmPassword (prev.confirmPassword)
        const isMatching = prev.confirmPassword === value;
        setPasswordMatching(isMatching);
      } 
      
      else if (name === 'confirmPassword') {
        // Match check: Compare new confirmPassword (value) with old password (prev.password)
        const isMatching = prev.password === value;
        setPasswordMatching(isMatching);
      }

      return newFormData;
    });
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage({ type: '', text: '' }); // Clear previous messages

    // Final checks using the latest formData values
    const errors = passwordValidation(formData.password);
    const isRequirementValid = Object.values(errors).every(Boolean); 
    const isMatching = formData.password === formData.confirmPassword; 
    
    setPasswordRequirment(errors); // Update UI requirements again
    setPasswordMatching(isMatching); // Update UI matching again
    
    if (!isRequirementValid) {
        setMessage({ type: 'error', text: 'Password must meet all requirements.' });
        setIsSubmitting(false);
        return;
    }

    if (!isMatching) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        setIsSubmitting(false);
        return;
    }

    // --- Success Logic ---
    try {
      const emailParts = formData.email.split('@');
      const emailDomain = emailParts.length === 2 ? emailParts[1].toLowerCase() : '';
      const userRole = emailDomain === TEACHER_DOMAIN.toLowerCase() ? 'teacher' : 'student';
      const supabase = createClient();
      const {data, error: authError} = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if(authError) {
        throw authError
      }
      
      const user = data?.user;

      const {error: profilesError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: user.id, 
            username: formData.username,
            firstname: formData.firstname,
            lastname: formData.lastname,
            role: userRole,
          }
        ])
      if (profilesError) {
            console.error('Profile insertion error:', profilesError);
            throw profilesError; 
        }

      setMessage({ type: 'success', text: 'Registration successful! Please check your email to confirm your account.' });
    } catch (error) {
      console.error('Registration error:', error.message);
        setMessage({ 
            type: 'error', 
            text: error.message.includes('already registered') 
              ? 'This email is already registered.'
              : error.message || 'An unexpected error occurred during registration.' 
        });
    } finally {
      setIsSubmitting(false);
    }
    
    
  }, [formData]); 
  // Helper component to display requirements visually
  const RequirementItem = ({ isValid, children }) => (
    <li className={`flex items-center space-x-2 transition-colors ${isValid ? 'text-green-600' : 'text-zinc-500'}`}>
      {isValid ? <CheckCircle size={14} /> : <XCircle size={14} />}
      <span>{children}</span>
    </li>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-300 font-sans text-zinc-900 p-4">
      <main className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Create an <span className="text-blue-600">Account</span>
        </h1>

        {/* General Message Box */}
        {message.text && (
            <div className={`p-3 rounded-lg text-sm mb-4 ${
                message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
                {message.text}
            </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstname" className="block font-medium mb-1">First Name</label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="lastname" className="block font-medium mb-1">Last Name</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block font-medium mb-1">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-medium mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-medium mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  !passwordMatching && formData.confirmPassword.length > 0 ? 'border-red-500 ring-red-500' : 'border-zinc-300 focus:ring-blue-500'
              }`}
            />
            {/* Real-time Requirement List */}
            <ul className="text-sm mt-2 space-y-1">
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
            <label htmlFor="confirmPassword" className="block font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  !passwordMatching && formData.confirmPassword.length > 0 ? 'border-red-500 ring-red-500' : 'border-zinc-300 focus:ring-blue-500'
              }`}
            />
            {!passwordMatching && formData.confirmPassword.length > 0 && (
                <p className="text-sm text-red-500 mt-1 flex items-center space-x-1">
                    <XCircle size={14} /> <span>Passwords do not match.</span>
                </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 rounded-lg font-medium transition ${
                isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>

          <p className="text-center text-sm mt-2">
            Already have an account? <a href="/" className="text-blue-600 hover:underline">Login</a>
          </p>
        </form>
      </main>
    </div>
  );
}