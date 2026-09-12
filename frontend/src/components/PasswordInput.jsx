import { useState } from "react";

const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-10.5-7-10.5-7a20.3 20.3 0 0 1 4.22-5.06M9.9 4.24A10.4 10.4 0 0 1 12 5c7 0 10.5 7 10.5 7a20.3 20.3 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
);

// A drop-in replacement for <input type="password">. Accepts the same
// props (id, name, value, onChange, placeholder, required, minLength,
// autoComplete) and adds a show/hide eye toggle.
function PasswordInput({ id, name, value, onChange, ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        {...rest}
      />

      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

export default PasswordInput;
