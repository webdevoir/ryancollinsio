import { createSelector } from 'reselect';

const getPosts = () => (state) => state.posts;
const getCurrentPage = () => (state) => state.currentPage;
const getPostsPerPage = () => (state) => state.postsPerPage;
const getSearchTerm = () => (state) => state.searchTerm;

export const getVisiblePosts = createSelector(
  getPosts(),
  getCurrentPage(),
  getPostsPerPage(),
  (posts, currentPage, postsPerPage) => {
    if (posts && posts.length > 0) {
      const current = currentPage - 1;
      const from = current * postsPerPage;
      const to = current * postsPerPage + postsPerPage;
      return posts.filter((_, i) =>
        i >= from && i < to
      );
    }
  }
);

export const getVisiblePostsFilteredBySearchTerm = createSelector(
  getVisiblePosts,
  getSearchTerm(),
  (visiblePosts, searchTerm) => {
    const filterableTerm = searchTerm && searchTerm !== '' ?
      searchTerm.toLowerCase() : null;
    if (filterableTerm) {
      return visiblePosts.filter(post =>
        post.title.toLowerCase().includes(filterableTerm) ||
          post.body.toLowerCase().includes(filterableTerm) ||
            post.author.name.toLowerCase().includes(filterableTerm)
      );
    }
    return visiblePosts;
  }
);