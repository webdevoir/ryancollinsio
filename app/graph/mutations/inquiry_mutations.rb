module InquiryMutations
  Create = GraphQL::Relay::Mutation.define do
    name 'CreateInquiry'
    description 'Create an inquiry'
    input_field :inquiry, InquiryInputType
    return_field :id, types.ID

    resolve -> (_object, inputs, _ctx) do
      parsed_inputs = inputs[:inquiry]
      inquiry = Inquiry.create(
        name: parsed_inputs[:name],
        email: parsed_inputs[:email],
        message: parsed_inputs[:message],
        category: parsed_inputs[:category]
      )
      if inquiry.save!
        InquiryMailer.inquiry_email({
          name: parsed_inputs[:name],
          email: parsed_inputs[:email],
          message: parsed_inputs[:message],
          category: parsed_inputs[:category]
        }).deliver_now
        {
          id: inquiry.id
        }
      end
    end
  end
end
