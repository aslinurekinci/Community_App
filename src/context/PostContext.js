import React, { createContext, useState, useContext } from 'react';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const addPost = (post) => setPosts((prev) => [post, ...prev]);

  const removePost = (id) =>
    setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <PostContext.Provider value={{ posts, setPosts, addPost, removePost }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);
