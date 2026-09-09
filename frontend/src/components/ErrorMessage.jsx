const ErrorMessage = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}) => {
  return (
    <div className="error-message" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
