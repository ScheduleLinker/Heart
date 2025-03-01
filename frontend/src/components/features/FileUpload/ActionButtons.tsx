/**
 * A parent component hat hosts file upload button and createButton
 * 
 * @component 
 * @param {null} - no props for now
 */


import FileUploadButton from "./FileUploadButton";
import CreateButton from "./CreateButton";
const ActionButtons = () => {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <FileUploadButton />
          <CreateButton />
        </div>
      </div>
    );
  };
  
  export default ActionButtons;