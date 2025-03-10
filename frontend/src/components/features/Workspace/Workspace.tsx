
const Workspace = () => {
  const uploadedData = localStorage.getItem('parsed-ics');
  return (
    <div className="relative min-h-screen pb-32"> {/* Add padding for floating bar */}
      {/* Main Content */}
      <div className="p-4">
        {uploadedData ? (
          // Your existing data display
          <div>The bubbles will get built and displayed here for now create is under devlopmenet</div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No data uploaded yet</p>
        )}
      </div>

      {/* Floating Toolbar */}
    </div>
  );
};

export default Workspace;