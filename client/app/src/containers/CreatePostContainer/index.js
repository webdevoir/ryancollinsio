import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as CreatePostActionCreators from './actions';
import cssModules from 'react-css-modules';
import styles from './index.module.scss';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { reduxForm } from 'redux-form';
import Headline from 'grommet-udacity/components/Headline';
import Box from 'grommet-udacity/components/Box';
import { WithToast, Divider, CreatePostForm, WithLoading } from 'components';
import { postData } from 'fragments';
import Section from 'grommet-udacity/components/Section';
import serializer from './model';

export const formFields = [
  'titleInput',
  'bodyInput',
  'tagsInput',
  'featureImageInput',
];

class CreatePostContainer extends Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCurrentTags = this.handleCurrentTags.bind(this);
    this.handleLoadingFromPost = this.handleLoadingFromPost.bind(this);
  }
  componentDidMount() {
    if (!this.props.user.authToken) {
      this.context.router.push('/');
    }
  }
  componentWillReceiveProps({ post }) {
    if (post && post !== this.props.post) {
      this.handleLoadingFromPost();
    }
  }
  handleLoadingFromPost() {
    const {
      fields,
      post,
    } = this.props;
    fields.titleInput.onChange(post.title);
    fields.bodyInput.onChange(post.body);
    fields.featureImageInput.onChange(post.image);
    this.props.actions.createPostSetSelectedTags(
      post.tags.map(tag => ({ title: tag.title }))
    );
  }
  handleSubmit() {
    const {
      submitPostMutation,
      fields,
      selectedTags,
      user,
    } = this.props;
    const data = {
      variables: serializer(fields, selectedTags, user.authToken),
    };
    submitPostMutation(data)
      .then(() => {
        const message = 'The post was successfully created! Redirecting.';
        this.props.actions.createPostSetMessage(message);
        setTimeout(() => {
          this.context.router.push('/blog');
        }, 2000);
      }).catch(({ message }) => {
        this.props.actions.createPostSetError(message);
      });
  }
  handleCurrentTags(vals) {
    const {
      tags,
    } = this.props;
    this.props.actions.createPostSetSelectedTags(
      vals.map(tag => tags[tag] || { title: tag })
    );
  }
  render() {
    const {
      actions,
      message,
      fields,
      tags,
      tagsLoading,
      invalid,
      tagsError,
      errorMessage,
      selectedTags,
    } = this.props;
    return (
      <WithLoading
        isLoading={tagsLoading}
      >
        <WithToast
          message={message}
          error={tagsError || errorMessage}
          onClose={(type) => actions.createPostClearToast(type)}
        >
          <Box className={styles.createPost} colorIndex="light-2">
            <Headline align="center">
              Create Post
            </Headline>
            <Divider />
            <Section align="center" justify="center">
              <CreatePostForm
                selectedTags={selectedTags}
                onSubmit={this.handleSubmit}
                onChangeTags={this.handleCurrentTags}
                invalid={invalid}
                fields={fields}
                pastTags={tags}
              />
            </Section>
          </Box>
        </WithToast>
      </WithLoading>
    );
  }
}

CreatePostContainer.propTypes = {
  submitPostMutation: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  message: PropTypes.string,
  fields: PropTypes.object.isRequired,
  tags: PropTypes.array,
  tagsError: PropTypes.object,
  tagsLoading: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
  selectedTags: PropTypes.array.isRequired,
  errorMessage: PropTypes.object,
  user: PropTypes.object.isRequired,
  post: PropTypes.object,
};

CreatePostContainer.contextTypes = {
  router: PropTypes.object.isRequired,
};

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = (state) => ({
  user: state.app.user,
  selectedTags: state.createPost.selectedTags,
  message: state.createPost.message,
  errorMessage: state.createPost.error ? { message: state.createPost.error } : null,
});

// mapDispatchToProps :: Dispatch -> {Action}
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    CreatePostActionCreators,
    dispatch
  ),
});

const Container = cssModules(CreatePostContainer, styles);

const FormContainer = reduxForm({
  form: 'CreatePost',
  fields: formFields,
})(Container);

const loadPostTagsQuery = gql`
  query loadPostTags {
    postTags {
      id
      title
    }
  }
`;

const ContainerWithData = graphql(loadPostTagsQuery, {
  props: ({ data: { postTags, loading, error } }) => ({
    tags: postTags,
    tagsLoading: loading,
    tagsError: error,
  }),
})(FormContainer);

const createPostMutation = gql`
  mutation createPost($authToken: String!, $post: PostInput) {
    CreatePost(input: { auth_token: $authToken, post: $post }) {
      post {
        id
      }
    }
  }
`;

const ContainerWithMutation = graphql(createPostMutation, {
  props: ({ mutate }) => ({
    submitPostMutation: mutate,
  }),
})(ContainerWithData);

const loadPostQuery = gql`
  query loadPost($id: ID!) {
    post(id: $id) {
      ...postData
    }
  }
`;

const ContainerWithPost = graphql(loadPostQuery, {
  options: (ownProps) => ({
    fragments: [postData],
    skip: !ownProps.location.query.postId,
    variables: {
      id: ownProps.location.query.postId,
    },
  }),
  props: ({ data: { post } }) => ({
    post,
  }),
})(ContainerWithMutation);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContainerWithPost);
