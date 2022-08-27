import React, { useContext } from "react";
import VisibilitySensor from "react-visibility-sensor";
import "./style.scss";

// -> containers
import {
  TextPost,
  ImagePost,
  VideoPost,
  LinkPost,
  YoutubePost,
  PollPost,
  RichTextPost,
} from "../../../../containers";

import PostInfo from "../post-info";
import PostControls from "../post-controls";
import { setUserEngagement } from "../../../../database";
import { UserContext } from "../../../../context/global/user-context";

const Post = ({ type, body, index, onDelete, fetchCommentsAlready }) => {
  const [user] = useContext(UserContext).user;

  let watchTs;
  return (
    <VisibilitySensor
      onChange={(visible) => {
        if (visible) {
          watchTs = Date.now();
        } else {
          let timeDiff = Date.now() - watchTs;

          if (parseInt(timeDiff / 1000) > 5) {
            if (user) {
              setUserEngagement(user.uid, body.id, parseInt(timeDiff / 1000));
            }
          }
        }
      }}
    >
      <div className="newsfeed-post">
        <PostInfo
          userId={body.data.create_user_id}
          groups={body.data.tags}
          timestamp={body.data.create_ts}
        />

        <div className="post-content">
          {type === 0 && <TextPost body={body.data.text} />}

          {type === "video" && (
            <RichTextPost text={body.data.description} have_multimedia />
          )}

          {type === <i className="fas fa-signal-1"></i> &&
            body.data.description !== null &&
            body.data.description.trim().length > 0 && (
              <TextPost body={body.data.description} />
            )}
          {type === "video" && <VideoPost body={body.data} postId={body.id} />}

          {type === "image" && (
            <RichTextPost text={body.data.description} have_multimedia />
          )}
          {type === "image" && <ImagePost body={body.data} />}

          {type === "link" &&
            body.data.description !== null &&
            body.data.description.trim().length > 0 && (
              <RichTextPost text={body.data.description} />
            )}
          {type === "link" && (
            <LinkPost
              url={body.data.url}
              title={body.data.page_title}
              thumbnail={body.data.thumbnail}
            />
          )}

          {type === "youtube" &&
            body.data.description !== null &&
            body.data.description.trim().length > 0 && (
              <RichTextPost text={body.data.description} have_multimedia />
            )}

          {type === "youtube" && <YoutubePost body={body.data} />}

          {type === "rich-text" && <RichTextPost text={body.data.rich_text} />}

          {type === "poll" && <PollPost body={body.data} id={body.id} />}
        </div>

        <PostControls
          index={index}
          onDelete={onDelete}
          body={body}
          fetchCommentsAlready={fetchCommentsAlready}
        />
      </div>
    </VisibilitySensor>
  );
};

export default Post;
