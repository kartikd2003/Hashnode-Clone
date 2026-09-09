const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <span className="loading-spinner__dot" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
};

export default LoadingSpinner;
