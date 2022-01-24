import Responses from '../../modules/responses/collection';
import { normalizeResponse } from './normalize';

const limit = 200;

// every 10 min, normalize 100 unnormalized responses
export const normalizeJob = async () => {
  const startAt = new Date();
  const unnormalizedResponses = Responses.find({ isNormalized: false }).fetch();
  const responsesToNormalize = Math.min(unnormalizedResponses.length, limit);
  if (unnormalizedResponses.length === 0) {
    // eslint-disable-next-line
    console.log('// 📊 Found 0 unnormalized responses.');
    return;
  }
  // eslint-disable-next-line
  console.log(
    `// 📊 Normalizing ${responsesToNormalize}/${unnormalizedResponses.length} unnormalized responses at ${startAt}…`
  );
  for (const response of unnormalizedResponses) {
    await normalizeResponse({ document: response });
  }
  const endAt = new Date();
  const diff = Math.abs(endAt - startAt);
  const duration = Math.ceil(diff / 1000);
  // eslint-disable-next-line
  console.log(`-> 📊 Done normalizing ${responsesToNormalize} responses in ${duration}s`);
};
