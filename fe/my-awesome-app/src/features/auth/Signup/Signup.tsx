import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Calendar, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { getCsrfHeaders } from '../../../utils/csrf';
import './Signup.css';

// Define the shape of your data (Similar to a Java DTO)
interface SignupFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  dob: string;
  password: string;
  confirmPassword: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormData>({
    mode: 'onSubmit'
  });
  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        dob: data.dob,
        password: data.password,
        role: data.role
      };

      const response = await fetch('http://localhost:8080/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCsrfHeaders()
        },
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'include'
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log("Success response content-type:", contentType);
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const successData = await response.json();
            console.log("Success data (JSON):", successData);
          } else {
            const textData = await response.text();
            console.log("Success data (Text):", textData);
          }
        } catch (parseError) {
          console.error("Error parsing success response:", parseError);
        }
        
        setMessage({ type: 'success', text: 'Account created successfully!' });
        setIsSignupSuccess(true);
      } else {
        let errorText = 'Signup failed. Please try again.';
        const contentType = response.headers.get('content-type');
        
        console.log("Error response status:", response.status);
        console.log("Error response content-type:", contentType);
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.log("Error data (JSON):", errorData);
            errorText = errorData.message || JSON.stringify(errorData) || errorText;
          } else {
            const textData = await response.text();
            console.log("Error data (Text):", textData);
            errorText = textData || errorText;
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
        }
        
        setMessage({ type: 'error', text: errorText });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        {isSignupSuccess ? (
          <div className="success-screen">
            <div className="success-icon">✓</div>
            <h1>Account Created Successfully!</h1>
            <p>Your account has been created. You can now login to your account.</p>
            <button 
              className="login-button-large"
              onClick={() => navigate('/login')}
            >
              Go to Login <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <>
            <header className="card-header">
              <h1>Create Account</h1>
              {/* <p>Please fill in your details to get started.</p> */}
            </header>

            {message && (
              <div className={`message-box ${message.type}`}>
                <div className="message-content">
                  <p>{message.text}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
              <div className="form-row">
                <div className="form-group">
                  <label><User size={16} /> First Name <span className="required-star">*</span></label>
                  <input {...register("firstName", { required: true })} placeholder="John" aria-invalid={!!errors.firstName} />
                </div>
                <div className="form-group">
                  <label>Last Name <span className="required-star">*</span></label>
                  <input {...register("lastName", { required: true })} placeholder="Doe" aria-invalid={!!errors.lastName} />
                </div>
              </div>

              <div className="form-group">
                <label>Username <span className="required-star">*</span></label>
                <input {...register("username", { required: true })} placeholder="johndoe123" aria-invalid={!!errors.username} />
              </div>

              <div className="form-group">
                <label><Mail size={16} /> Email Address <span className="required-star">*</span></label>
                <input type="email" {...register("email", { 
                  required: true,
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address"
                  }
                })} placeholder="john@example.com" aria-invalid={!!errors.email} />
                {errors.email && errors.email.type === 'pattern' && <span className="error-text">{errors.email.message}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><Calendar size={16} /> DOB <span className="required-star">*</span></label>
                  <input type="date" {...register("dob", { required: true })} aria-invalid={!!errors.dob} />
                </div>
              </div> 

              <div className="form-group password-field">
                <label><Lock size={16} /> Password <span className="required-star">*</span></label>
                <div className="input-with-icon">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    {...register("password", { required: true, minLength: { value: 6, message: "Password must be at least 6 characters" } })} 
                    aria-invalid={!!errors.password}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-btn">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && errors.password.type === 'minLength' && <span className="error-text">{errors.password.message}</span>}
              </div>

              <div className="form-group password-field">
                <label><Lock size={16} /> Confirm Password <span className="required-star">*</span></label>
                <div className="input-with-icon">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    {...register("confirmPassword", { 
                      required: true,
                      validate: (value) => value === password || "Passwords do not match"
                    })} 
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="toggle-btn">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && errors.confirmPassword.type === 'validate' && <span className="error-text">{errors.confirmPassword.message}</span>}
              </div>

              <button type="submit" className="signup-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'}
              </button>

              <div className="login-link">
                Already have an account? <button type="button" onClick={() => navigate('/login')} className="link-button">Login here</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;