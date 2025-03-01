import FileUploadButton from "./FileUploadButton";
import CreateButton from "./CreateButton";
import GlobalDragDrop from "../DragandDrop/GlobalDragDrop";
const ActionButtons = () => {
  const handleFilesDropped = (files:File[]) => {
    console.log('Files dropped in upload page: ', files);
  }
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <GlobalDragDrop 
            onFilesDropped={handleFilesDropped}
            dropPromptText="Release to Upload"
            showFileList={true}>
            <FileUploadButton />
            <CreateButton />
          </GlobalDragDrop>
        </div>
      </div>
    );
  };
  
  export default ActionButtons;