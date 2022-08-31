import { addRoute, getSetting } from "meteor/vulcan:core";

import Surveys from "../components/pages/Surveys";

import AccountPage from "../components/users/AccountPage";

// import SurveySection from '../components/survey/SurveySection';
// import SurveySectionReadOnly from '../components/survey/SurveySectionReadOnly';

import AdminStats from "../components/admin/AdminStats";
import AdminNormalization from "../components/admin/AdminNormalization";
import AdminSurveys from "../components/admin/AdminSurveys";
import AdminResponses from "../components/admin/AdminResponses";
import AdminUsers from "../components/admin/AdminUsers";

const adminAccessOptions = {
  groups: ["admins"],
};

// TODO: acces not yet taken into account
const routes = [
  // Ongoing, need to work on permission access
  {
    name: "adminStats",
    path: "/admin/stats",
    component: AdminStats,
    access: adminAccessOptions,
  },
  {
    name: "adminNormalization",
    path: "/admin/normalization",
    component: AdminNormalization,
    access: adminAccessOptions,
  },
  {
    name: "adminSurveys",
    path: "/admin/surveys",
    component: AdminSurveys,
    access: adminAccessOptions,
  },
  {
    name: "adminResponses",
    path: "/admin/responses",
    component: AdminResponses,
    access: adminAccessOptions,
  },
  {
    name: "adminUsers",
    path: "/admin/users",
    component: AdminUsers,
    access: adminAccessOptions,
  },
];

if (Meteor.isDevelopment && getSetting("environment") === "development") {
  // routes.push({name:'admin.emails',         path: '/admin/emails',                componentName: 'Emails',         },)
  // NOT done yet
  routes.push({
    name: "admin.database",
    path: "/admin/database",
    componentName: "DebugDatabase",
  });
}

addRoute(routes);
