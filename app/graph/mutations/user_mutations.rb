module UserMutations
  RequestPasswordInstructions = GraphQL::Relay::Mutation.define do
    name 'RequestPasswordInstructions'
    description 'When a user requests that their password be reset, send them an email'
    input_field :email, !types.String

    return_field :success, types.Boolean
    resolve -> (inputs, _ctx) do
      user = User.find_by(email: inputs[:email])
      if user
        user.send_reset_password_instructions
        {
          success: true
        }
      else
        {
          success: false
        }
      end
    end
  end
  ResetPassword = GraphQL::Relay::Mutation.define do
    name 'ResetPassword'
    description 'When a user returns to the password reset route with a token to reset password'
    input_field :token, !types.String
    input_field :password, !types.String
    input_field :password_confirmation, !types.String

    return_field :user, AuthUserType
    resolve -> (inputs, _ctx) do
      user = User.with_reset_password_token(inputs[:token])
      if user
        User.reset_password_by_token(
          reset_password_token: inputs[:token],
          password: inputs[:password],
          password_confirmation: inputs[:password_confirmation]
        )
        user.reload
        {
          user: user
        }
      else
        {
          user: nil
        }
      end
    end
  end
  SignUp = GraphQL::Relay::Mutation.define do
    name 'SignUp'
    description 'Sign up a User'
    input_field :user_signup, UserSignupInputType

    return_field :user, AuthUserType
    resolve -> (_object, inputs, _ctx) do
      input_args = inputs[:user_signup]
      @user = User.create(
        name: input_args[:name],
        email: input_args[:email],
        password: input_args[:password],
        password_confirmation: input_args[:password_confirmation]
      )
      if @user.save
        {
          user: @user
        }
      end
    end
  end
  SignIn = GraphQL::Relay::Mutation.define do
    name 'SignIn'
    description 'Sign in a User'
    input_field :email, !types.String
    input_field :password, !types.String

    return_field :user, AuthUserType
    resolve -> (_object, inputs, _ctx) do
      @user = User.find_for_database_authentication(email: inputs[:email])
      if @user.valid_password?(inputs[:password])
        {
          user: @user
        }
      else
        {
          user: {}
        }
      end
    end
  end
end
