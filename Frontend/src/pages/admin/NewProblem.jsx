function NewProblem() {
  return (
    <div className="newproblem">
      <h3>Problem Title</h3>
      <input
        className="login-fields"
        type="text"
        placeholder="A Suitable Title for the problem "
      />
      <h3>Problem Statement</h3>
      <input
        className="login-fields"
        type="text"
        placeholder="A Clear Stement for What is expected  "
      />
      <h3>Problem Description</h3>
      <input
        className="login-fields"
        type="text"
        placeholder="Provide All the data inputs related to the Question"
      />
      <h3>Give Constraints</h3>
      <input
        className="login-fields"
        type="text"
        placeholder="Constraints Here "
      />
      <h3>Pre Test</h3>
      <input
        className="login-fields"
        type="text"
        placeholder="Enter PreTest values"
      />
      <h3>Upload TestCase File in .txt Format</h3>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <label for="fileUpload">Upload a file:</label>
        <input type="file" id="fileUpload" name="userFile" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default NewProblem