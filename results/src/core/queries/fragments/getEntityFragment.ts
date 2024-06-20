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
}`
