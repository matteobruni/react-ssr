import React, { useState, useEffect, useContext } from "react";
import "./style.scss";

import { useHistory, useParams } from "react-router-dom";
import PostContextProvider from "../../../context/newsfeed/PostContext";
import Post from "../../../containers/newsfeed/posts/post";
import {
  NewsFeedPage,
  NewsFeedTodaySessionsBar,
  Navbar,
} from "../../../containers";
import { getPostById } from "../../../database/newsfeed/database";
import {
  NewsFeedContextProvider,
  CreatePostContextProvider,
  NavbarContextProvider,
  UserContext,
} from "../../../context";

export default function NewsFeedPostView() {
  //------------------------------------ constants hooks
  const [post, setPost] = useState([]);
  const [fetchingPost, setfetchingPost] = useState(true);
  const [user] = useContext(UserContext).user;

  let history = useHistory();
  let { id } = useParams();
  var _post_info_fetched;

  useEffect(() => {
    getAndSetPostInfo();
  }, []);

  //----------------------------------- functions

  function sendToUrl(string) {
    history.go(string);
  }

  const getAndSetPostInfo = async () => {
    _post_info_fetched = await getPostById(id, user.grade);
    setfetchingPost(false);
    setPost(_post_info_fetched);
  };

  const [isMobileOpen, setisMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setisMobileOpen(!isMobileOpen);
  };

  //----------------------------------- render JSX
  return (
    <>
      {/* // <div className="postView"> */}

      <NavbarContextProvider>
        <Navbar setMobileOpen={handleDrawerToggle} />
      </NavbarContextProvider>

      <div className="newsfeed-body">
        <NewsFeedContextProvider>
          <NewsFeedPage>
            <CreatePostContextProvider>
              <PostContextProvider>
                <div className="doubt-page">
                  <div className="doubt-page-center">
                    {post?.length !== 0 && post !== null && (
                      <Post
                        onDelete={(e) => {
                          var url = window.location.origin;
                          sendToUrl(`${url}/newsfeed`);
                        }}
                        index={post[0].index}
                        key={post[0].id}
                        type={post[0].data.type}
                        body={post[0]}
                        fetchCommentsAlready
                      />
                    )}

                    {fetchingPost && <p>Fetching Post...</p>}
                    {post === null && <>No post found</>}
                  </div>
                  <div className="doubt-page-rightbar">
                    <NewsFeedTodaySessionsBar />
                  </div>
                </div>
              </PostContextProvider>
            </CreatePostContextProvider>
          </NewsFeedPage>
        </NewsFeedContextProvider>
      </div>
      {/* // </div> */}
    </>
  );
}
