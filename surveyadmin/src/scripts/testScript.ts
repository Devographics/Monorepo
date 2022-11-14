export const testScript__testArg1__testArg2 = async (args) => {
  const { testArg1, testArg2 } = args;
  console.log("// Test script!!");
  return { foo: 123, testArg1, testArg2 };
};
