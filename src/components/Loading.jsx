const spinnerStyle = {
  animation: 'kerala-spin 1s linear infinite',
};

const spinnerStyleReverse = {
  animation: 'kerala-spin 1.5s linear infinite reverse',
};

const keyframesStyle = `
@keyframes kerala-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const Loading = ({ fullScreen = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Inject keyframes once */}
      <style>{keyframesStyle}</style>

      {/* Two-ring spinner */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer ring — Kerala green */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: '#1B6B3A',
            borderRightColor: '#1B6B3A',
            ...spinnerStyle,
          }}
        />
        {/* Inner ring — Kerala gold */}
        <div
          className="absolute inset-2 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: '#D4A017',
            borderLeftColor: '#D4A017',
            ...spinnerStyleReverse,
          }}
        />
        {/* Centre dot */}
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: '#1B6B3A' }}
        />
      </div>

      {/* Brand text */}
      <span
        className="text-sm font-semibold tracking-widest uppercase"
        style={{ color: '#1B6B3A' }}
      >
        Kerala Yard
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
};

export default Loading;
