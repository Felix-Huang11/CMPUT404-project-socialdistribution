import React from "react";
import { List, message, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getRequest } from "../../requests/requestFriendRequest";
import {
  getAuthorByAuthorID,
  getRemoteAuthorByAuthorID,
} from "../../requests/requestAuthor";
import SingleRequest from "../SingleRequest";
import { domainAuthPair } from "../../requests/URL";
import { getDomainName } from "../Utils";

export default class InboxRequest extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      requestDataSet: [],
      authorID: this.props.authorID,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    getRequest({
      authorID: this.state.authorID,
    }).then((res) => {
      if (res.status === 200) {
        this.getRequestDataSet(res.data).then((value) => {
          this.setState({ requestDataSet: value });
        });
      } else {
        message.error("Fail to get my requests.");
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getRequestDataSet = (requestData) => {
    let promise = new Promise(async (resolve, reject) => {
      const requestSet = [];
      for (const element of requestData) {
        // show actor names
        const domain = getDomainName(element.actor.id);
        if (domain !== window.location.hostname) {
          requestSet.push({
            actorName: element.actor.displayName,
            actorID: element.actor.id,
            remote: true,
          });
        } else {
          requestSet.push({
            actorName: element.actor.displayName,
            actorID: element.actor.id,
            remote: false,
          });
        }
      }
      resolve(requestSet);
    });

    return promise;
  };

  render() {
    const { requestDataSet } = this.state;

    return (
      <div style={{ margin: "0 20%" }}>
        <List
          bordered
          itemLayout="horizontal"
          dataSource={requestDataSet}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={item.actorName}
                description=" wants to follow you."
              />
              <SingleRequest
                authorID={this.state.authorID}
                actorID={item.actorID}
                remote={item.remote}
              />
            </List.Item>
          )}
        />
      </div>
    );
  }
}
