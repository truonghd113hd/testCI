export const QueuePrefixKey = '{Queue}';
export const QueueName = {
  Email: 'Email',
};

export const QueueJob = {
  HandleSendEmail: `${QueueName.Email}::SendEmail`,
};
