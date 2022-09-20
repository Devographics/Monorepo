// import { PrivateResponses } from '../../modules/private_responses';
// import { subscribeEmail } from 'meteor/vulcan:newsletter';

// TODO
// not needed for now
// export const exportEmailAddresses = async () => {
//   const unexportedResponses = PrivateResponses.find({
//     emailExported: false,
//     'user_info.email': { $exists: true },
//   }).fetch();

//   console.log(`Found ${unexportedResponses.length} email addresses to add…`);

//   for (const response in unexportedResponses) {
//     const { surveySlug, user_info = {} } = response;
//     const { email } = user_info;
//   }
//   // return await subscribeEmail(email);
// };
