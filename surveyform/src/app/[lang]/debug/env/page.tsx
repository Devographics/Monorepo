export default function EnvVars() {
  console.log(process.env.TEST_VAR);
  console.log(process.env.NEXT_PUBLIC_TEST_VAR);
  return (
    <div>
      {process.env.TEST_VAR}
      {process.env.NEXT_PUBLIC_TEST_VAR}
    </div>
  );
}
