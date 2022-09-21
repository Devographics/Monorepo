// TODO: is it still needed (2022/03)?
/*

Raw Responses Migrations

*/

// null = "do nothing with this field"

// test
export const js2019FieldMigrations = {
  device: "common__user_info__device",
  browser: "common__user_info__browser",
  version: "common__user_info__version",
  os: "common__user_info__os",
  referrer: "common__user_info__referrer",
  aboutyou_youremail: "email",

  syntax_arrowfunctions: "js2019__features__arrow_functions__experience",
  syntax_destructuring: "js2019__features__destructuring__experience",
  syntax_spreadoperator: "js2019__features__spread_operator__experience",
  language_asyncawait: "js2019__features__async_await__experience",
  language_decorators: "js2019__features__decorators__experience",
  language_promises: "js2019__features__promises__experience",
  language_proxies: "js2019__features__proxies__experience",
  datastructures_arrayprototypeflat:
    "js2019__features__array_prototype_flat__experience",
  datastructures_maps: "js2019__features__maps__experience",
  datastructures_sets: "js2019__features__sets__experience",
  datastructures_typedarrays: "js2019__features__typed_arrays__experience",
  browserapis_fetchapi: "js2019__features__fetch__experience",
  browserapis_i18n: "js2019__features__intl__experience",
  browserapis_localstorage: "js2019__features__local_storage__experience",
  browserapis_serviceworkers: "js2019__features__service_workers__experience",
  browserapis_webanimationsapi: "js2019__features__web_animations__experience",
  browserapis_webaudioapi: "js2019__features__web_audio__experience",
  browserapis_webcomponents: "js2019__features__web_components__experience",
  browserapis_webgl: "js2019__features__webgl__experience",
  browserapis_webrtc: "js2019__features__webrtc__experience",
  browserapis_websocket: "js2019__features__websocket__experience",
  browserapis_webspeechapi: "js2019__features__web_speech__experience",
  browserapis_webvr: "js2019__features__webvr__experience",
  otherfeatures_progressivewebappspwa: "js2019__features__pwa__experience",
  otherfeatures_webassemblywasm: "js2019__features__wasm__experience",
  patterns_functionalprogramming: "js2019__patterns__functional_programming",
  patterns_objectorientedprogramming:
    "js2019__patterns__object_oriented_programming",
  patterns_reactiveprogramming: "js2019__patterns__reactive_programming",

  javascriptflavors_clojurescript: "js2019__tools__clojurescript__experience",
  javascriptflavors_elm: "js2019__tools__elm__experience",
  javascriptflavors_purescript: "js2019__tools__purescript__experience",
  javascriptflavors_reason: "js2019__tools__reason__experience",
  javascriptflavors_typescript: "js2019__tools__typescript__experience",
  javascriptflavors_otherjavascriptflavors:
    "js2019__tools_others__javascript_flavors__others",
  javascriptflavors_overallhappiness: "js2019__happiness__javascript_flavors",

  frontendframeworks_angular: "js2019__tools__angular__experience",
  frontendframeworks_ember: "js2019__tools__ember__experience",
  frontendframeworks_preact: "js2019__tools__preact__experience",
  frontendframeworks_react: "js2019__tools__react__experience",
  frontendframeworks_svelte: "js2019__tools__svelte__experience",
  frontendframeworks_vue: "js2019__tools__vuejs__experience",
  frontendframeworks_otherfrontendframeworks:
    "js2019__tools_others__front_end_frameworks__others",
  frontendframeworks_overallhappiness:
    "js2019__happiness__front_end_frameworks",

  datalayer_apollo: "js2019__tools__apollo__experience",
  datalayer_graphql: "js2019__tools__graphql__experience",
  datalayer_mobx: "js2019__tools__mobx__experience",
  datalayer_redux: "js2019__tools__redux__experience",
  datalayer_relay: "js2019__tools__relay__experience",
  datalayer_otherdatalayertools: "js2019__tools_others__data_layer__others",
  datalayer_overallhappiness: "js2019__happiness__data_layer",

  backendframeworks_express: "js2019__tools__express__experience",
  backendframeworks_feathersjs: "js2019__tools__feathers__experience",
  backendframeworks_gatsbyjs: "js2019__tools__gatsby__experience",
  backendframeworks_koa: "js2019__tools__koa__experience",
  backendframeworks_meteor: "js2019__tools__meteor__experience",
  backendframeworks_nextjs: "js2019__tools__nextjs__experience",
  backendframeworks_nuxtjs: "js2019__tools__nuxt__experience",
  backendframeworks_sails: "js2019__tools__sails__experience",
  backendframeworks_otherbackendframeworks:
    "js2019__tools_others__back_end_frameworks__others",
  backendframeworks_overallhappiness: "js2019__happiness__back_end_frameworks",

  testing_ava: "js2019__tools__ava__experience",
  testing_cypress: "js2019__tools__cypress__experience",
  testing_enzyme: "js2019__tools__enzyme__experience",
  testing_jasmine: "js2019__tools__jasmine__experience",
  testing_jest: "js2019__tools__jest__experience",
  testing_mocha: "js2019__tools__mocha__experience",
  testing_puppeteer: "js2019__tools__puppeteer__experience",
  testing_storybook: "js2019__tools__storybook__experience",
  testing_othertestingtools: "js2019__tools_others__testing__others",
  testing_overallhappiness: "js2019__happiness__testing",

  mobiledesktop_cordova: "js2019__tools__cordova__experience",
  mobiledesktop_electron: "js2019__tools__electron__experience",
  mobiledesktop_expo: "js2019__tools__expo__experience",
  mobiledesktop_ionic: "js2019__tools__ionic__experience",
  mobiledesktop_nativeapps: "js2019__tools__nativeapps__experience",
  mobiledesktop_nwjs: "js2019__tools__nwjs__experience",
  mobiledesktop_reactnative: "js2019__tools__reactnative__experience",
  mobiledesktop_othermobiledesktoptools:
    "js2019__tools_others__mobile_desktop__others",
  mobiledesktop_overallhappiness: "js2019__happiness__mobile_desktop",

  othertools_browsers: "js2019__tools_others__browsers__choices",
  othertools_otherbrowsers: "js2019__tools_others__browsers__others",

  othertools_buildtools: "js2019__tools_others__build_tools__choices",
  othertools_otherbuildtools: "js2019__tools_others__build_tools__others",

  othertools_texteditors: "js2019__tools_others__text_editors__choices",
  othertools_othereditors: "js2019__tools_others__text_editors__others",

  othertools_utilities: "js2019__tools_others__utilities__choices",
  othertools_otherutilities: "js2019__tools_others__utilities__others",

  othertools_nonjslanguages: "js2019__tools_others__non_js_languages__choices",
  othertools_otherlanguages: "js2019__tools_others__non_js_languages__others",

  resources_blogsnewsmagazines:
    "js2019__resources__blogs_news_magazines__choices",
  resources_otherblogs: "js2019__resources__blogs_news_magazines__others",

  resources_podcasts: "js2019__resources__podcasts__choices",
  resources_otherpodcasts: "js2019__resources__podcasts__others",

  resources_sitescourses: "js2019__resources__sites_courses__choices",
  resources_othercourses: "js2019__resources__sites_courses__others",

  opinionquestions_buildingjavascriptappsisoverlycomplexrightnow:
    "js2019__opinions__building_js_apps_overly_complex",
  opinionquestions_ienjoybuildingjavascriptapps:
    "js2019__opinions__enjoy_building_js_apps",
  opinionquestions_iwouldlikejavascripttobemymainprogramminglanguage:
    "js2019__opinions__would_like_js_to_be_main_lang",
  opinionquestions_javascriptismovingintherightdirection:
    "js2019__opinions__js_moving_in_right_direction",
  opinionquestions_javascriptisoverusedonline:
    "js2019__opinions__js_over_used_online",
  opinionquestions_thejavascriptecosystemischangingtoofast:
    "js2019__opinions__js_ecosystem_changing_to_fast",
  opinionquestions_whatdoyoufeeliscurrentlymissingfromjavascript:
    "js2019__opinions_others__missing_from_js__others",

  aboutyou_backendproficiency: "js2019__user_info__backend_proficiency",
  aboutyou_companysize: "js2019__user_info__company_size",
  aboutyou_cssproficiency: "js2019__user_info__css_proficiency",
  aboutyou_howdidyoufindoutaboutthissurvey:
    "js2019__user_info__how_did_user_find_out_about_the_survey",
  aboutyou_jobtitle: "js2019__user_info__job_title",
  aboutyou_yearlysalary: "js2019__user_info__yearly_salary",
  aboutyou_yearsofexperience: "js2019__user_info__years_of_experience",
  aboutyou_yourcountry: "js2019__user_info__country",
  aboutyou_yourgender: "js2019__user_info__gender",
  aboutyou_othergender: "js2019__user_info__gender__others",
  aboutyou_otherjobtitle: "js2019__user_info__job_title__others",

  // the following fields will be copied over without any modification
  createdAt: null,
  updatedAt: null,
  completion: null,
  userId: null,
  surveyId: null,
  _id: null,
  source: null,
  year: null,
  surveySlug: null,
};

export const js2019ExperienceNormalizationValues = {
  neverheard: "never_heard",
  heard: "heard",
  used: "used",

  interested: "interested",
  not_interested: "not_interested",
  would_use_again: "would_use",
  would_not_use_again: "would_not_use",
};

// the following fields were stored as full strings in 2019 but should
// now be converted to ids instead ('CSS Tricks' => 'css_tricks')
export const js2019ChoicesFieldsToNormalize = [
  "js2019__tools_others__browsers__choices",
  "js2019__tools_others__build_tools__choices",
  "js2019__tools_others__text_editors__choices",
  "js2019__tools_others__utilities__choices",
  "js2019__tools_others__non_js_languages__choices",
  "js2019__resources__blogs_news_magazines__choices",
  "js2019__resources__podcasts__choices",
  "js2019__resources__sites_courses__choices",
];

export const js2019ChoicesNormalizationValues = {
  Edge: "edge",
  Chrome: "chrome",
  Safari: "safari",
  Firefox: "firefox",

  Webpack: "webpack",
  Parcel: "parcel",
  Gulp: "gulp",
  RollUp: "rollup",
  FuseBox: "fusebox",
  Browserify: "browserify",

  "VS Code": "visual_studio",
  "Sublime Text": "sublime_text",
  Atom: "atom",
  Vim: "vim",
  Emacs: "emacs",
  Webstorm: "webstorm",

  Immer: "immer",
  Lodash: "lodash",
  Underscore: "underscore",
  Moment: "moment",
  "Date Fns": "date_fns",
  Ramda: "ramda",
  jQuery: "jquery",
  RxJS: "rxjs",

  PHP: "php",
  Ruby: "ruby",
  Python: "python",
  Go: "go",
  Rust: "rust",
  Java: "java",
  "C/C++": "c_cplusplus",
  "Objective-C": "objective_c",
  Scala: "scala",
  Swift: "swift",
  "C#": "csharp",
  ".NET": "dotnet",
  Haskell: "haskell",
  OCaml: "ocaml",
  Dart: "dart",

  "CSS Tricks": "css_tricks",
  "Smashing Magazine": "smashing_magazine",
  CoDrops: "codrops",
  SitePoint: "sitepoint",
  "David Walsh": "david_walsh",
  DailyJS: "daily_js",
  "Echo JS": "echo_js",
  "Front-End Front": "front_end_front",
  "JavaScript Weekly": "js_weekly",
  "Dev.to": "devto",
  "Best of JS": "bestofjs",

  "Shop Talk Show": "shop_talk_show",
  "The Changelog": "changelog",
  Syntax: "syntaxfm",
  "JS Party": "js_party",
  "JavaScript Jabber": "javascript_jabber",
  "Full Stack Radio": "full_stack_radio",
  "Front End Happy Hour": "front_end_happy_hour",
  "JAMstack Radio": "jamstack_radio",
  "The Web Platform Podcast": "web_platform_podcast",
  "Modern Web": "modern_web",
  "CodePen Radio": "codepen_radio",

  "Stack Overflow": "stack_overflow",
  MDN: "mdn",
  W3Schools: "w3schools",
  FreeCodeCamp: "freecodecamp",
  Codecademy: "codecademy",
  "LevelUp Tutorials": "levelup",
  "Wes Bos Courses (GSSGrid.io, Flexbox.io, etc.)": "wesbos",
  "Wes Bos Courses (CSSGrid.io, Flexbox.io, etc.)": "wesbos",
  Pluralsight: "pluralsight",
  DesignCode: "designcode",
};

export const js2019OptionsFieldsToNormalize = [
  "js2019__user_info__years_of_experience",
  "js2019__user_info__job_title",
  "js2019__user_info__css_proficiency",
  "js2019__user_info__backend_proficiency",
  "js2019__user_info__company_size",
  "js2019__user_info__yearly_salary",
  "js2019__user_info__gender",
];

export const js2019OptionsNormalizationValues = {
  "Less than one year": "range_less_than_1",
  "1-2 years": "range_1_2",
  "2-5 years": "range_2_5",
  "5-10 years": "range_5_10",
  "10-20 years": "range_10_20",
  "20+ years": "range_more_than_20",

  "Front-end Developer/Engineer": "front_end_developer",
  "Full-stack Developer/Engineer": "full_stack_developer",
  "Back-end Developer/Engineer": "back_end_developer",
  "Web Developer": "web_developer",

  "Level 1: virtually no knowledge of CSS": 0,
  "Level 2: using CSS frameworks and tweaking existing styles": 1,
  "Level 3: knowing specificity rules, being able to create layouts": 2,
  "Level 4: mastering animations, interactions, transitions, etc.": 3,
  "Level 5: being able to style an entire front-end from scratch following a consistent methodology": 4,

  "Level 1: not able to handle any back-end work": 0,
  "Level 2: able to set up all-in-one CMSs (WordPress, etc.) or static site generators (Jekyll, etc.)": 1,
  "Level 3: able to develop apps using pre-existing frameworks (Rails, Laravel, etc.)": 2,
  "Level 4: setting up an entire back-end from scratch (Go, Node, etc.)": 3,
  "Level 5: able to handle complex multi-server or microservices architectures": 4,

  "Just me": "range_1",
  "1-5 people": "range_1_5",
  "5-10 people": "range_5_10",
  "10-20 people": "range_10_20",
  "20-50 people": "range_20_50",
  "50-100 people": "range_50_100",
  "100-1000 people": "range_100_1000",
  "1000+ people": "range_more_than_1000",

  "I work for free :(": "range_work_for_free",
  "$0-$10k": "range_0_10",
  "$10k-$30k": "range_10_30",
  "$30k-$50k": "range_30_50",
  "$50k-$100k": "range_50_100",
  "$100k-$200k": "range_100_200",
  "$200k+": "range_more_than_200",

  Female: "female",
  Male: "male",
  "Non-binary/ third gender": "non_binary",
  "Prefer not to say": "prefer_not_to_say",
};

export const allValuesMigrations = {
  ...js2019OptionsNormalizationValues,
  ...js2019ChoicesNormalizationValues,
  ...js2019ExperienceNormalizationValues,
};

export const normalizeJS2019Value = (value) => {
  if (allValuesMigrations[value]) {
    return allValuesMigrations[value];
  } else {
    return value;
  }
};

/*

Normalized Responses Migrations

*/

export const otherValueNormalisations = {
  "user_info.yearly_salary": {
    work_for_free: "range_work_for_free",
    "0_10": "range_0_10",
    "10_30": "range_10_30",
    "30_50": "range_30_50",
    "50_100": "range_50_100",
    "100_200": "range_100_200",
    more_than_200: "range_more_than_200",
  },
  "user_info.gender": {
    "non-binary/ third gender": "non_binary",
    "prefer not to say": "prefer_not_to_say",
  },
  "user_info.company_size": {
    1: "range_1",
    "1_5": "range_1_5",
    "5_10": "range_5_10",
    "10_20": "range_10_20",
    "20_50": "range_20_50",
    "50_100": "range_50_100",
    "100_1000": "range_100_1000",
    more_than_1000: "range_more_than_1000",
  },
  "user_info.years_of_experience": {
    less_than_1: "range_less_than_1",
    "1_2": "range_1_2",
    "2_5": "range_2_5",
    "5_10": "range_5_10",
    "10_20": "range_10_20",
    more_than_20: "range_more_than_20",
  },
};
