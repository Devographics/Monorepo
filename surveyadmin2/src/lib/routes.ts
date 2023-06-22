export const routes = {
  home: {
    href: "/",
  },
  admin: {
    normalization: {
      href: ({
        surveyId,
        editionId,
        questionId,
      }: {
        surveyId?: string;
        editionId?: string;
        questionId?: string;
      }) => {
        let route = `/admin/normalization/`;
        if (surveyId) {
          route += `${surveyId}/`;
        }
        if (editionId) {
          route += `${editionId}/`;
        }
        if (questionId) {
          route += `${questionId}/`;
        }
        return route;
      },
    },
  },
};
