import { NextPageParams } from "~/app/typings";
import { MagicLoginChecker } from "./MagicLoginChecker";
import { CenteredContainer } from "~/components/ui/CenteredContainer";

export default async function MagicLoginCheckPage({
  searchParams,
}: NextPageParams<any, { token: string; from?: string }>) {
  const { token, from } = searchParams;
  if (!token) throw new Error("No magic token found in query params.");
  if (Array.isArray(token))
    throw new Error("Found more than one token in query params.");
  if (from && Array.isArray(from)) {
    console.warn("Found more than one redirection router in query params.");
  }
  return (
    <CenteredContainer>
      <MagicLoginChecker token={token} from={from} />
    </CenteredContainer>
  );
}
