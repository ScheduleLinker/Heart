describe("Upload Button Test", () => {
  it("Should upload a file when the upload button is clicked", () => {
    cy.visit("/upload");
    cy.get("input[type='file']").selectFile("path/to/testfile.txt");
    cy.get("button").click(); // "button" can be changed to #uploadButton just testing out the E2E framework
    cy.contains("File uploaded successfully").should("be.visible");
  });
});