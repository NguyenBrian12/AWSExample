import React from "react";
import { Label } from "reactstrap";
import { PostFile, UploadFile, DeleteFile } from "../services/file.service.js";
import { FormGroup, Input, Button } from "reactstrap";
import { dataURLToBlob } from "blob-util";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import PropTypes from "prop-types";
import { css } from "react-emotion";
// First way to import
import { ClipLoader } from "react-spinners";
const initialState = {
  image: null,
  url: "",
  previousImage: null,
  blob: null,
  imageType: "",
  key: "",
  err: false,
  success: null,
  awsUrl: null,
  loading: false,
  isBusiness: false
};
const PacmanLoader = css(`
className:PacmanLoader
`);

class ImageUploader extends React.Component {
  static propTypes = { onComplete: PropTypes.func.isRequired };

  state = initialState;

  fileInputRef = React.createRef();
  componentDidMount = () => {
    if (this.props.isBusiness) {
      this.setState({ isBusiness: true });
    }
  };
  // This will be called from the parent
  reset = () => {
    this.setState(initialState);
  };

  handleImageToAWS = () => {
    this.setState({ loading: true });
    if (this.state.imageType.match(/image.*/)) {
      const dataUrl = this.refs.cropper.getCroppedCanvas().toDataURL();
      console.log(dataUrl);
      const blob = dataURLToBlob(dataUrl);
      this.setState({ blob: blob });
      console.log(blob);
      PostFile({ contentType: blob.type }).then(response => {
        console.log(response);
        console.log(response.data);
        const URL = response.data;
        UploadFile(URL, blob)
          .then(response => {
            let URL = response.config.url;
            console.log(URL);
            let cropUrl = response.config.url.split("?");
            const cropper = cropUrl[0];
            const key = cropper.split("Grolo/")[1];
            console.log(key);
            this.setState({
              previousImage: URL,
              key: key,
              dataUrl: null,
              success: true,
              awsUrl: cropper,
              image: null,
              loading: false
            });
            this.fileInputRef.current.value = null;
            this.props.onComplete(cropper);
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

  handleImageUpload = () => {
    this.setState({
      err: false,
      image: null
    });
    if (this.state.previousImage) {
      const key = this.state.key;
      console.log("works");
      DeleteFile({ contentType: key }).then(response => {
        let URL = response;
        console.log(URL);
      });
    }
    if (this.fileInputRef.current.files[0]) {
      if (this.fileInputRef.current.files[0].type.match(/image.*/)) {
        const file = this.fileInputRef.current.files[0];
        var reader = new FileReader();
        console.log(file);
        reader.addEventListener(
          "load",
          () => {
            this.setState({
              dataUrl: reader.result
            });
          },
          false
        );
        let data = reader.readAsDataURL(file);
        console.log(data);
        this.setState({
          image: data,
          imageType: file.type
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
          <div className="input-group">
            <div className="custom-file">
              <Input
                type="file"
                className="custom-file-input"
                id="inputGroupFile04"
                aria-describedby="inputGroupFileAddon04"
                innerRef={this.fileInputRef}
                name="file"
                onChange={this.handleImageUpload}
              />
              <Label className="custom-file-label" for="inputGroupFile04">
                Choose file
              </Label>
            </div>
            {this.state.isBusiness ? (
              <div>
                <select
                  className="custom-select"
                  id="inputGroupSelect01"
                  style={{ width: "125px" }}
                  onChange={this.props.onChange}
                  name="imgSelect"
                >
                  <option selected>Image Type</option>
                  <option value="logo">Logo</option>
                  <option value="banner">Banner</option>
                </select>
              </div>
            ) : (
              <div>{null}</div>
            )}

            <div className="input-group-append">
              <Button
                className="btn btn-outline-secondary"
                type="button"
                id="inputGroupFileAddon04"
                disabled={this.state.image === null}
                onClick={this.handleImageToAWS}
              >
                Upload
              </Button>
            </div>
          </div>
        </FormGroup>
        {this.state.dataUrl && (
          <Cropper
            ref="cropper"
            src={this.state.dataUrl}
            style={{ height: 200, width: "100%" }}
            // Cropper.js options
            aspectRatio={16 / 9}
            guides={false}
            crop={this._crop}
          />
        )}
        <div>
          {/* <button
            type="button"
            disabled={this.state.image === null}
            onClick={this.handleImageToAWS}
          >
            Upload Cropped Image
          </button> */}
          <div>
            <ClipLoader
              className={PacmanLoader}
              sizeUnit={"px"}
              size={25}
              color={"f8244f"}
              loading={this.state.loading}
            />
          </div>
        </div>
        <div>
          {this.state.success === true ? (
            <span>This image has been successfully uploaded</span>
          ) : (
            ""
          )}
        </div>
        <div>
          {" "}
          {this.state.success === true ? (
            <img src={this.state.awsUrl} alt="description" style={{ width: "100%" }} />
          ) : (
            ""
          )}
        </div>
        {this.state.err === true ? <span>Please enter an image or video</span> : ""}
      </div>
    );
  }
}
export default ImageUploader;
