export const getEntityFragment = () => `entity {
    name
    nameHtml
    nameClean
    alias
    description
    descriptionHtml
    descriptionClean
    id
    entityType
    example {
      label
      language
      code
      codeHighlighted
    }
    avatar {
      url
    }
    homepage {
      url
    }
    youtube {
      url
    }
    twitter {
      url
    }
    twitch {
      url
    }
    rss {
      url
    }
    blog {
        url
    }
    mastodon {
        url
    }
    github {
        url
    }
    npm {
        url
    }
    mdn {
        url
    }
    caniuse {
        url
    }
    resources {
        url
        title
    }
    webFeature {
        id
        description_html
        group
        name
        spec
        status {
            baseline
            baseline_low_date
            support {
            chrome
            chrome_android
            edge
            firefox
            firefox_android
            safari
            safari_ios
            }
        }
    }
}`
