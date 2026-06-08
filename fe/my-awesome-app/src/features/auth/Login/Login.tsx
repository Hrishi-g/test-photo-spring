import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { getCsrfHeaders } from '../../../utils/csrf';
import './Login.css';

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useOutletContext<{ setUser: (user: any) => void }>();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    mode: 'onSubmit'
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getCsrfHeaders() },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'include'
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        let userData = null;
        if (contentType && contentType.includes('application/json')) {
            userData = await response.json();
            // We no longer store in localStorage. Rely on the httpOnly cookie sent by backend.
            setUser(userData); // Update the global user state
        }
        
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        
        // Redirect to specific landing page based on role directly
        setTimeout(() => {
            if (userData && userData.role === 'ADMIN') {
                navigate('/landing', { state: { user: userData } }); // We can still use /landing, but pass state or handle it there
            } else {
                navigate('/landing', { state: { user: userData } });
            }
        }, 1500);
      } else {
        const contentType = response.headers.get('content-type');
        let errorText = 'Invalid username or password';
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorText = errorData.message || JSON.stringify(errorData);
          } else {
            const textData = await response.text();
            errorText = textData || errorText;
          }
        } catch (e) {
          console.error("Error parsing response:", e);
        }

        setMessage({ type: 'error', text: errorText });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <header className="card-header">
          <h1>Welcome Back</h1>
          {/* <p>Please fill in your details to login.</p> */}
        </header>

        {message && (
          <div className={`message-box ${message.type}`}>
            <div className="message-content">
              <p>{message.text}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label><User size={16} /> Username <span className="required-star">*</span></label>
            <input 
              {...register("username", { required: true })} 
              placeholder="johndoe123" 
              aria-invalid={!!errors.username} 
            />
          </div>

          <div className="form-group password-field">
            <label><Lock size={16} /> Password <span className="required-star">*</span></label>
            <div className="input-with-icon">
              <input 
                type={showPassword ? "text" : "password"} 
                {...register("password", { required: true })} 
                aria-invalid={!!errors.password}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-btn">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="signup-link">
            Don't have an account? <button type="button" onClick={() => navigate('/signup')} className="link-button">Sign up here</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;