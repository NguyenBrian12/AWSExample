import React from "react";
import { PostFile, UploadFile, DeleteFile } from "../services/file.service.js";
import { FormGroup, Input } from "reactstrap";
import Cropper from "react-cropper";
import "cropperjs/src/css/cropper.css";
import PropTypes from "prop-types";
import { css } from "react-emotion";
// First way to import
import { ClipLoader } from "react-spinners";
const initialState = {
  file: null,
  url: "",
  previousFile: null,
  blob: null,
  awsUrl: null,
  fileType: "",
  key: "",
  err: false,
  success: null
};
const PacmanLoader = css(`
className:PacmanLoader
`);

class FileUploader extends React.Component {
  static propTypes = { onComplete: PropTypes.func.isRequired };
  state = initialState;

  fileInputRef = React.createRef();

  // This will be called from the parent
  reset = () => {
    this.setState(initialState);
  };

  handleFileToAWS = () => {
    this.setState({ loading: true });
    if (this.state.fileType.match(/application.*/)) {
      PostFile({ contentType: this.state.fileType }).then(response => {
        console.log(response);
        const URL = response.data;
        const dataUrl = this.fileInputRef.current.files[0];
        console.log(this.fileInputRef.current.files[0]);
        this.setState({ blob: dataUrl });
        UploadFile(URL, dataUrl)
          .then(response => {
            let URL = response.config.url;
            console.log(URL);
            let fileUrl = response.config.url.split("?");
            const file = fileUrl[0];
            const key = file.split("Grolo/")[1];
            console.log(key);
            this.setState({
              previousFile: URL,
              awsUrl: file,
              key: key,
              dataUrl: null,
              success: true,
              file: null,
              loading: false
            });
            this.fileInputRef.current.value = null;
            this.props.onComplete(file);
          })
          .catch(err => {
            console.log(err);
          });
      });
    } else {
      this.setState({
        loading: false
      });
      return null;
    }
  };

  handleFileUpload = () => {
    this.setState({
      err: false,
      file: null
    });
    if (this.state.previousFile) {
      const key = this.state.key;
      console.log("works");
      DeleteFile({ contentType: key }).then(response => {
        let URL = response;
        console.log(URL);
      });
    }
    if (this.fileInputRef.current.files[0]) {
      if (this.fileInputRef.current.files[0].type.match(/application.*/)) {
        const file = this.fileInputRef.current.files[0];
        var reader = new FileReader();
        console.log(this.fileInputRef.current.files[0].type);
        reader.addEventListener(
          "load",
          () => {
            this.setState({ dataUrl: reader.result });
          },
          false
        );
        let data = reader.readAsDataURL(file);
        console.log(data);
        this.setState({
          file: data,
          fileType: file.type
        });
      } else {
        this.setState({
          err: true,
          dataUrl: null
        });
      }
    }
  };
  render() {
    return (
      <div>
        <FormGroup>
          <Input
            name="file"
            innerRef={this.fileInputRef}
            type="file"
            onChange={this.handleFileUpload}
          />
        </FormGroup>
        <div>
          <button type="button" disabled={this.state.file === null} onClick={this.handleFileToAWS}>
            Upload File
          </button>
        </div>
        <div>
          <ClipLoader
            className={PacmanLoader}
            sizeUnit={"px"}
            size={25}
            color={"f8244f"}
            loading={this.state.loading}
          />
        </div>
        <div>
          {this.state.success === true ? <span>This file has been successfully uploaded</span> : ""}
        </div>
        {this.state.err === true ? <span>Please enter a file</span> : ""}
      </div>
    );
  }
}
export default FileUploader;
