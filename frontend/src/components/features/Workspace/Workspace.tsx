import { useUploadStore } from "@/stores/uploadStore";

const Workspace = () => {
  const { uploadedData } = useUploadStore(); // Access the uploaded data
  console.log(uploadedData);

  return (
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <h2 className="text-2xl font-bold text-cyan-400">Workspace</h2>
      {uploadedData ? (
        <pre className="text-sm text-white">
          {JSON.stringify(uploadedData.data.events[0].summary)}
        </pre>
      ) : (
        <p className="text-white">No data uploaded yet.</p>
      )}
    </div>
  );
};

export default Workspace;