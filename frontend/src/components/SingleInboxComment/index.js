import React from "react";
import { message, Avatar, Button, Card, List, Popover, Tag, Tabs } from "antd";
import {
  UserOutlined,
  UserAddOutlined,
  HeartTwoTone,
  ShareAltOutlined,
  CommentOutlined,
  EditOutlined,
  DeleteOutlined,
  CloudServerOutlined
} from "@ant-design/icons";
import CommentArea from "../CommentArea";
import {
  getCommentList,
  getRemoteCommentList,
} from "../../requests/requestComment";
import {
  postRequest,
  postRemoteRequest,
} from "../../requests/requestFriendRequest";
import {
  getAuthorByAuthorID,
  getRemoteAuthorByAuthorID,
} from "../../requests/requestAuthor";
import EditPostArea from "../EditPostArea";
import ConfirmModal from "../ConfirmModal";
import CommentItem from "../SingleComment";
import {
  getLikes,
  sendLikes,
  getRemoteLikes,
  sendRemoteLikes,
} from "../../requests/requestLike";
import { deletePost, sendPost, sendPostToUserInbox } from "../../requests/requestPost";
import { getFollowerList } from "../../requests/requestFollower";
import { auth, remoteDomain } from "../../requests/URL";
import { getHostname } from "../Utils";

const { TabPane } = Tabs;

const tagsColor = {
  Movies: "lime",
  Books: "blue",
  Music: "volcano",
  Sports: "cyan",
  Life: "gold",
};
export default class PostDisplay extends React.Component {
  state = {
    comments: [],
    friendComments:[],
    temp:[],
    isModalVisible: false,
    isEditModalVisible: false,
    isDeleteModalVisible: false,
    authorID: this.props.authorID,
    isLiked: false,
    likesList: [],
    friendLikes:[],
    isShared:
      this.props.rawPost.source !== this.props.rawPost.origin ? true : false,
    followers: [],
  };

  componentDidMount() {
    getFollowerList({ object: this.state.authorID, }).then((res) => {
      if (res.status === 200) {
        this.setState({ followers: res.data.items });
      }
    });
    
    if (this.props.remote) {
      //remote
      getRemoteCommentList({
        URL: `${this.props.postID}/comments/`,
        auth: auth,
      }).then((res) => {
        if (res.status === 200) {
          this.getCommentDataSet(res.data).then((value) => {
            this.setState({ comments: value });
            this.state.comments.forEach((item) => {
              if (item.authorID.split("/")[4]===item.postID.split("/")[4] ||item.authorID === this.state.authorID ) {
                this.state.temp.push(item)      
              }
            });
            this.setState({ friendComments: this.state.temp });
          });
        }
      });
    } else {
      getCommentList({ postID: this.props.postID }).then((res) => {
        if (res.status === 200) {
          this.getCommentDataSet(res.data).then((value) => {
            this.setState({ comments: value });           
            this.state.comments.forEach((item) => {
              if (item.authorID.split("/")[4]===item.postID.split("/")[4] ||item.authorID === this.state.authorID ) {
                this.state.temp.push(item)      
              }
            });
            this.setState({ friendComments: this.state.temp });        
          }); 
        }
      });
    }
    
    if (this.props.remote) {
      getRemoteLikes({
        URL: `${this.props.postID}/likes/`,
        auth: auth,
      }).then((res) => {
        if (res.status === 200) {
          this.getLikeDataSet(res.data).then((val) => {
            this.setState({ likesList: val });
            this.state.likesList.forEach((item) => {
              if (item.authorID === this.state.authorID) {
                this.setState({ isLiked: true });
              }
              if (item.authorID === this.state.authorID) {
                this.setState({friendLikes : val });
              }
            });
          });
        } else {
          message.error("Remote: Request failed!");
        }
      });
    } else {
      getLikes({ _object: this.props.postID }).then((res) => {
        if (res.status === 200) {
          this.getLikeDataSet(res.data).then((val) => {
            this.setState({ likesList: val });
            this.state.likesList.forEach((item) => {
              if (item.authorID === this.state.authorID) {
                this.setState({ isLiked: true });
              }
              if (item.authorID === this.state.authorID) {
                this.setState({friendLikes : val });
              }
            });
          });
        } else {
          message.error("Request failed!");
        }
      });
    }
  }
  
  getCommentDataSet = (commentData) => {
    let promise = new Promise(async (resolve, reject) => {
      const commentsArray = [];
      for (const comment of commentData) {
        const host = getHostname(comment.author);
        let authorInfo;
        if (host !== window.location.hostname) {
          authorInfo = await getRemoteAuthorByAuthorID({
            URL: comment.author,
            auth: auth,
          });
        } else {
          authorInfo = await getAuthorByAuthorID({
            authorID: comment.author,
          });
        }
        commentsArray.push({
          authorName: authorInfo.data.displayName,
          authorID: comment.author,
          comment: comment.comment,
          published: comment.published,
          commentid: comment.id,
          eachCommentLike: false,
          postID: comment.post,
          actor: this.state.authorID,
          remote: this.props.remote,
        });
      }
      resolve(commentsArray);
    });
    return promise;
  };

  getLikeDataSet = (likeData) => {
    let promise = new Promise(async (resolve, reject) => {
      const likeArray = [];
      for (const like of likeData) {
        const host = getHostname(like.author);
        let authorInfo;
        if (host !== window.location.hostname) {
          authorInfo = await getRemoteAuthorByAuthorID({
            URL: like.author,
            auth: auth,
          });
        } else {
          authorInfo = await getAuthorByAuthorID({
            authorID: like.author,
          });
        }
        likeArray.push({
          authorName: authorInfo.data.displayName,
          authorID: like.author,
        });
      }
      resolve(likeArray);
    });
    return promise;
  };

  handleClickFollow = async () => {
    var n = this.props.postID.indexOf("/posts/");
    if (this.props.remote) {
      let params = {
        actor: this.props.authorID,
        object: this.props.postID.substring(0, n),
        summary: "I want to follow you!",
        URL: `${remoteDomain}/friend-request/`,
        auth: auth,
        remote: true,
      };
      postRemoteRequest(params).then((response) => {
        if (response.status === 200) {
          message.success("Remote: Request sent!");
          window.location.reload();
        } else if (response.status === 409) {
          message.error("Remote: Invalid request!");
        } else {
          message.error("Remote: Request failed!");
        }
      });
    } else {
      let params = {
        actor: this.props.authorID,
        object: this.props.postID.substring(0, n),
        summary: "I want to follow you!",
      };
      postRequest(params).then((response) => {
        if (response.status === 200) {
          message.success("Request sent!");
          window.location.reload();
        } else if (response.status === 409) {
          message.error("Invalid request!");
        } else {
          message.error("Request failed!");
        }
      });
    }
  };

  handleClickReply = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  handleClickShare = async () => {
    let rawPost = this.props.rawPost;
    rawPost.authorID = this.state.authorID;
    rawPost.author = this.state.authorID;
    rawPost.visibility = "FRIENDS";
    rawPost.source = this.state.authorID;
    if (rawPost.source !== rawPost.origin) {
      //create a new post object
      sendPost(rawPost).then((response) => {
        if (response.status === 200) {
          message.success("Post shared!");
          window.location.reload();
        } else {
          message.error("Whoops, an error occurred while sharing.");
        }
      });
      //send to your friends's inbox
      for (const eachFollower of this.state.followers){
        let params = {
          URL: `${eachFollower}/inbox/box/`,
          auth: auth,
          body: rawPost,
        }
        sendPostToUserInbox(params).then((response) => {
          if (response.status === 200) {
            message.success("Post shared!");
            window.location.reload();
          } else {
            message.error("Whoops, an error occurred while sharing.");
          }
        }); 
      }
    } else {
      message.error("You cannot share your own post.");
    }
  };

  handleClickEdit = () => {
    this.setState({ isEditModalVisible: !this.state.isEditModalVisible });
  };

  handleClickDelete = () => {
    this.setState({ isDeleteModalVisible: !this.state.isDeleteModalVisible });
  };

  handleCommentModalVisiblility = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  handleEditPostModalVisiblility = () => {
    this.setState({ isEditModalVisible: !this.state.isEditModalVisible });
  };

  handleDeletePostModalVisiblility = () => {
    this.setState({ isDeleteModalVisible: !this.state.isDeleteModalVisible });
  };

  deleteSelectedPost = () => {
    deletePost({ postID: this.props.postID }).then((res) => {
      if (res.status === 200) {
        window.location.reload();
      } else {
        message.error("Fail to delete the post.");
      }
    });
  };

  handleClickLike = () => {
    if (this.state.isLiked === false) {
      this.setState({
        isLiked: true,
      });

      let params = {
        postID: this.props.postID,
        actor: this.props.authorID,
        object: this.props.postID,
        summary: "I like your post!",
        context: this.props.postID,
      };
      if (this.props.remote) {     
        params.URL = `${this.props.postID}/likes/`;
        params.auth = auth;
        sendRemoteLikes(params).then((response) => {
          if (response.status === 200) {
            message.success("Remote Likes sent!");
          } else {
            message.error("Remote likes send failed!");
          }
        });
      } else {
        sendLikes(params).then((response) => {
          if (response.status === 200) {
            message.success("Likes sent!");
          } else {
            message.error("Likes failed!");
          }
        });
      }
    } else {
      this.setState.isLiked = true;
    }
  };
  commentLikes = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  clickLikeComment = (item) => {
    if (item.eachCommentLike === false) {
      this.setState({
        eachCommentLike: true,
      });

      let params = {
        postID: this.props.postID,
        actor: this.props.authorID,
        object: item.commentid,
        summary: "I like your comment!",
        context: this.props.postID,
      };
      sendLikes(params).then((response) => {
        if (response.status === 200) {
          message.success("Likes sent!");
        } else {
          message.error("Likes failed!");
        }
      });
    }
  };

  render() {
    const {
      title,
      authorName,
      github,
      content,
      datetime,
      postID,
      categories,
      enableEdit,
    } = this.props;

    const userInfo = (
      <div>
        <p>{authorName}</p>
        <p>{github}</p>
        <Button icon={<UserAddOutlined />} onClick={this.handleClickFollow} />
      </div>
    );

    const editButton = enableEdit ? (
      <Button
        type="text"
        style={{ color: "#C5C5C5" }}
        onClick={this.handleClickEdit}
      >
        <EditOutlined /> Edit
      </Button>
    ) : (
      ""
    );

    const deleteButton = enableEdit ? (
      <Button
        type="text"
        style={{ color: "#C5C5C5" }}
        onClick={this.handleClickDelete}
      >
        <DeleteOutlined /> Delete
      </Button>
    ) : (
      ""
    );

    const likeIconColor = this.state.isLiked ? "#eb2f96" : "#A5A5A5";

    const tags =
      categories !== undefined
        ? categories.map((tag) => (
            <Tag key={tag} color={tagsColor[tag]}>
              {tag}
            </Tag>
          ))
        : "";

    return (
      <div>
        <Card
          title={
            <span>
              <ShareAltOutlined
                style={{
                  color: "#4E89FF",
                  display: this.state.isShared ? "" : "none",
                }}
              />
              <CloudServerOutlined style={{
                  color: "#4E89FF",
                  display: this.props.remote ? "" : "none",
                }}/>
              {"  " + title}
            </span>
          }
          extra={
            <span>
              <Popover content={userInfo} title="User Info" trigger="click">
                <Avatar icon={<UserOutlined />} /> {authorName}
              </Popover>
            </span>
          }
        >
          <div style={{ margin: "24px", textAlign: "center" }}>{content}</div>
          <div style={{ margin: "16px 0" }}>{tags}</div>
          <div>
            <HeartTwoTone
              twoToneColor={likeIconColor}
              onClick={this.handleClickLike}
            />
            <Button
              type="text"
              style={{ color: "#C5C5C5" }}
              onClick={this.handleClickReply}
            >
              <CommentOutlined /> Reply to
            </Button>

            <Button
              type="text"
              style={{ color: "#C5C5C5" }}
              onClick={this.handleClickShare}
            >
              <ShareAltOutlined /> Share
            </Button>
            {editButton}
            {deleteButton}
            <p
              style={{
                color: "#C5C5C5",
                fontSize: "small",
                float: "right",
              }}
            >
              {datetime}
            </p>
          </div>
          <div
            style={{
              clear: "both",
            }}
          />
          <Tabs
            defaultActiveKey="comments"
            type="card"
            size="small"
            style={{
              marginTop: "16px",
            }}
          >
            <TabPane tab="Comments" key="comments">
              {this.state.friendComments.length === 0 ? (
                ""
              ) : (
                <List
                  bordered
                  dataSource={this.state.friendComments}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={item.authorName}
                        description={item.published}
                      />
                      {item.comment}
                      <CommentItem item={item} />
                    </List.Item>
                  )}
                />
              )}
            </TabPane>
            <TabPane tab="Likes" key="likes">
              {this.state.friendLikes.length === 0 ? (
                ""
              ) : (
                <List
                  dataSource={this.state.friendLikes}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={item.authorName}
                        description={"likes this post."}
                      />
                    </List.Item>
                  )}
                />
              )}
            </TabPane>
          </Tabs>

          <CommentArea
            authorID={this.props.authorID}
            postID={postID}
            visible={this.state.isModalVisible}
            handleCommentModalVisiblility={this.handleCommentModalVisiblility}
            remote={this.props.remote}
          />
          <EditPostArea
            authorID={this.props.authorID}
            postID={postID}
            visible={this.state.isEditModalVisible}
            handleEditPostModalVisiblility={this.handleEditPostModalVisiblility}
          />
          <ConfirmModal
            visible={this.state.isDeleteModalVisible}
            handleConfirmModalVisiblility={
              this.handleDeletePostModalVisiblility
            }
            dosomething={this.deleteSelectedPost}
          />
        </Card>
      </div>
    );
  }
}