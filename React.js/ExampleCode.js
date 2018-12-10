import React from "react";
import PropTypes from "prop-types";
import {
  SubmitAsset,
  UpdateAsset,
  GetAssetById,
  DeleteAsset,
  GetBusinessId
} from "../../services/asset.service.js";
import { FormGroup, Label, Input } from "reactstrap";
import ImageUploader from "../../shared/ImageUploader";
import ReactPlayer from "react-player";
import Confirmation from "../../shared/Confirmation";
import { connect } from "react-redux";
import { NotificationManager } from "react-notifications";
const numberRegex = RegExp(/[^\d]/);
class AssetForm extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
  };
  state = {
    id: "",
    url: "",
    name: "",
    typeId: null,
    description: "",
    appUserId: 1,
    editMode: false,
    businessId: null,
    tenantId: null,
    formErrors: {
      name: "",
      description: "",
      url: "",
      typeId: "",
      success: "",
      hidePicture: true
    }
  };
  imageUploaderRef = React.createRef();

  componentDidMount() {
    const user = this.props.user;
    GetBusinessId(user.id).then(response => {
      this.setState({ businessId: response.data.item[0].id });
    });

    const { assetId } = this.props.match.params;
    if (assetId) {
      GetAssetById(assetId).then(response => {
        const asset = response.data.item[0];
        this.setState({
          name: asset.name,
          id: asset.id,
          url: asset.url,
          typeId: asset.typeId,
          description: asset.description,
          appUserId: asset.appUserId,
          businessId: asset.businessId,
          tenantId: asset.tenantId,
          editMode: true
        });
        if (asset.typeId === 1) {
          this.setState({ hidePicture: true });
        }
      });
    }
  }

  handleInputChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = { ...this.state.formErrors };
    this.setState({ formErrors, [name]: value });
    switch (name) {
      case "name":
        formErrors.name = value.length < 2 ? "minimum 2 characters required" : "";
        break;
      case "description":
        formErrors.description = value.length < 2 ? "minimum 2 characters required" : "";
        break;
      case "url":
        formErrors.url = value === true ? "" : "";
        break;
      case "typeId":
        formErrors.typeId = numberRegex.test(value) ? "" : "number required";
        break;
      default:
        break;
    }
  };
  handleClearAsset = () => {
    this.setState({
      id: null,
      url: "",
      name: "",
      typeId: "",
      description: "",
      appUserId: "",
      ready: null
    });
  };
  handleSubmitAsset = () => {
    SubmitAsset({
      url: this.state.url,
      typeId: this.state.typeId,
      name: this.state.name,
      description: this.state.description,
      appUserId: this.state.appUserId,
      businessId: this.state.businessId,
      tenantId: this.props.user.tenantId
    }).then(NotificationManager.success("You created a new asset!", "Success!"));
    this.setState({
      id: null,
      url: "",
      name: "",
      typeId: "",
      description: "",
      appUserId: "",
      ready: null
    });
  };
  handleUpdateAsset = () => {
    UpdateAsset({
      id: this.state.id,
      url: this.state.url,
      typeId: this.state.typeId,
      name: this.state.name,
      description: this.state.description,
      appUserId: this.state.appUserId,
      tenantId: this.props.user.tenantId,
      businessId: this.state.businessId
    }).then(NotificationManager.success("You updated your asset!", "Success!"));
    this.setState({ editMode: false });
    this.props.history.push("/admin/assets/search");
  };
  handleDeleteAsset = id => {
    DeleteAsset(id).then(this.props.history.push("/admin/assets/search"));
  };
  handleOptionChange = changeEvent => {
    this.setState({
      typeId: parseInt(changeEvent.target.value, 10),
      url: null
    });
  };
  render() {
    const { formErrors } = this.state;
    return (
      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title"> Asset Form</h4>
          </div>
          <div className="card-body">
            <div className="px-3">
              <div className="form-body">
                <form className="form">
                  <FormGroup>
                    <Label>Name:</Label>
                    <Input
                      className="form-control"
                      type="text"
                      name="name"
                      value={this.state.name}
                      onChange={this.handleInputChange}
                    />
                    <div>{formErrors.name.length > 0 && <span>{formErrors.name}</span>}</div>
                  </FormGroup>
                  <FormGroup>
                    <Label>Description:</Label>
                    <Input
                      className="form-control"
                      type="text"
                      name="description"
                      value={this.state.description}
                      onChange={this.handleInputChange}
                    />
                    <div>
                      {formErrors.description.length > 0 && <span>{formErrors.description}</span>}
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label>Image or Video URL:</Label>
                    <div>
                      <div>
                        <input
                          type="checkbox"
                          name="picture"
                          value={1}
                          checked={this.state.typeId === 1}
                          onChange={this.handleOptionChange}
                        />{" "}
                        <Label>Image</Label>
                        {this.state.typeId === 1 ? (
                          <div style={{ width: 400 }}>
                            <Label>Image Upload:</Label>
                            <ImageUploader
                              ref={this.imageUploaderRef}
                              onComplete={url => this.setState({ url: url, hidePicture: null })}
                            />
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          name="video"
                          value={2}
                          checked={this.state.typeId === 2}
                          onChange={this.handleOptionChange}
                        />{" "}
                        <Label>Video</Label>
                        {this.state.typeId === 2 ? (
                          <div>
                            <Label>Video Upload:</Label>
                            <Input
                              className="form-control"
                              type="text"
                              name="url"
                              value={this.state.url}
                              onChange={this.handleInputChange}
                            />
                          </div>
                        ) : (
                          ""
                        )}
                        <div>{formErrors.url.length > 0 && <span>{formErrors.url}</span>}</div>
                      </div>

                      <div>{formErrors.typeId.length > 0 && <span>{formErrors.typeId}</span>}</div>
                    </div>
                    {this.state.editMode && this.state.typeId === 1 && this.state.hidePicture ? (
                      <img src={this.state.url} width="400px" alt="img" />
                    ) : (
                      ""
                    )}

                    {this.state.editMode && this.state.typeId === 2 ? (
                      <ReactPlayer
                        style={{ padding: 0 }}
                        url={this.state.url}
                        youtubeConfig={{ playerVars: { showinfo: 1 } }}
                        width="400px"
                      />
                    ) : (
                      ""
                    )}
                  </FormGroup>
                  <br />
                  {!this.state.editMode ? (
                    <button
                      disabled={!this.state.ready}
                      className="btn btn-success"
                      type="button"
                      onClick={this.handleSubmitAsset}
                      style={{ margin: 10 }}
                    >
                      <icon className="fa fa-thumbs-o-up mr-2" />
                      Submit
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={this.handleUpdateAsset}
                      style={{ margin: 10 }}
                    >
                      <icon className="fa fa-pencil mr-2" />
                      Update
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.handleClearAsset}
                    style={{ margin: 10 }}
                  >
                    <icon className="fa fa-times-circle mr-2" />
                    Cancel
                  </button>
                  {this.state.editMode ? (
                    <Confirmation
                      buttonLabel="Delete"
                      header="Are you sure you want to delete?"
                      execute={() => this.handleDeleteAsset(this.state.id)}
                    >
                      Your asset will be deleted
                    </Confirmation>
                  ) : (
                    ""
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    user: state.user
  };
}
export default connect(mapStateToProps)(AssetForm);
