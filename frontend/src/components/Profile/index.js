import React from "react";
import { Button, Descriptions } from "antd";
import { getAuthorUseID } from "../../requests/requestAuthor";
import ProfileChange from "../ProfileChange";
import GitHubCalendar from "react-github-calendar";
import { GithubOutlined } from "@ant-design/icons";

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      authorID: this.props.authorID,
      username: this.props.username,
      displayName: this.props.displayName,
      github: this.props.github,
      isModalVisible: false,
    };
  }

  componentDidMount() {
    if (this.state.authorID === "") {
      this.setState({ authorID: this.props.authorID });
    } else if (this.state.authorID !== undefined) {
      getAuthorUseID({ authorID: this.state.authorID }).then((res) => {
        this.setState({
          displayName: res.data.displayName,
          github: res.data.github,
        });
      });
    }
  }

  handleClick = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  handleChangeModalVisibility = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  render() {
    return (
      <div style={{ margin: "10% 20%", textAlign: "center" }}>
        <Descriptions title="User Info">
          <Descriptions.Item label="UserName">
            {this.state.username}
          </Descriptions.Item>
          <Descriptions.Item label="displayName">
            {this.state.displayName}
          </Descriptions.Item>
          <Descriptions.Item label="github">
            {this.state.github}
          </Descriptions.Item>
        </Descriptions>
        {/* change info */}
        <Button
          type="primary"
          onClick={this.handleClick}
          style={{ width: "120px" }}
        >
          Change Info
        </Button>
        {/* logout */}
        <Button
          type="primary"
          danger
          onClick={this.props.logout}
          style={{ marginLeft: "100px", width: "120px" }}
        >
          Logout
        </Button>
        <ProfileChange
          authorID={this.props.authorID}
          displayName={this.state.displayName}
          github={this.state.github}
          visible={this.state.isModalVisible}
          handleChangeModalVisibility={this.handleChangeModalVisibility}
        />
        <div style={{ marginTop: "5%" }}>
          <GithubOutlined/>
          <Descriptions title="My Github Activity"></Descriptions>
          <GitHubCalendar
            username={/\w+(?!.*\w+)/.exec(this.state.github)}
            years={[2021]}
            blockMargin={5}   
          />
        </div>
      </div>
    );
  }
}
