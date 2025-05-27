export const testScript = async (args) => {
  const { testArg1, testArg2 } = args;
  console.log("// Test script!!");
  return { foo: 123, testArg1, testArg2 };
};

testScript.args = ["testArg1", "testArg2"];

testScript.description = `A simple test script with two arguments. `;

testScript.category = "utilities";
