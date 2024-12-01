import { NextPageParams } from "~/app/typings";
import { MagicLoginChecker } from "./MagicLoginChecker";

import { CenteredContainer } from "~/components/ui/CenteredContainer";


export default async function MagicLoginCheckPage(
  props: NextPageParams<
    { token: string; redirectTo?: string; editionId?: string; surveyId?: string }
  >
) {
  const searchParams = await props.searchParams;
  const { token, redirectTo, editionId, surveyId } = searchParams;
  if (!token) throw new Error("No magic token found in query params.");
  return (
    <CenteredContainer>
      <MagicLoginChecker
        token={token}
        redirectTo={redirectTo}
        editionId={editionId}
        surveyId={surveyId}
      />
    </CenteredContainer>
  );
}
