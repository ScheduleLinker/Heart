/**
 * A parent component hat hosts file upload button and createButton
 * 
 * @component 
 * @param {null} - no props for now
 */


import FileUploadButton from "./FileUploadButton";
import CreateButton from "./CreateButton";
import GlobalDragDrop from "../DragandDrop/GlobalDragDrop";
const ActionButtons = () => {
 
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <GlobalDragDrop 
            dropPromptText="Release to Upload"
            showFileList={true}>
            <FileUploadButton />
           {/* // <CreateButton /> */}
          </GlobalDragDrop>
        </div>
      </div>
    );
  };
  
  export default ActionButtons;