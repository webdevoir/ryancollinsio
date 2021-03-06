import * as types from './constants';
import update from 'react-addons-update';

export const initialState = {
  error: null,
  message: null,
  currentPage: 1,
  perPage: 6,
  posts: [],
};

const blogReducer =
  (state = initialState, action) => {
    switch (action.type) {
      case types.SET_BLOG_POSTS:
        return update(state, {
          posts: {
            $set: action.posts,
          },
        });
      case types.BLOG_SET_CURRENT_PAGE:
        return update(state, {
          currentPage: {
            $set: action.page,
          },
        });
      case types.BLOG_ERROR:
        return update(state, {
          error: {
            $set: action.error,
          },
        });
      case types.BLOG_MESSAGE:
        return update(state, {
          message: {
            $set: action.message,
          },
        });
      case types.CLEAR_BLOG_ERROR:
        return update(state, {
          error: {
            $set: null,
          },
        });
      case types.CLEAR_BLOG_MESSAGE:
        return update(state, {
          message: {
            $set: null,
          },
        });
      default:
        return state;
    }
  };

export default blogReducer;
