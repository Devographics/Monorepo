// import { Entity } from './src/types'

declare module '*.graphql' {
    import { DocumentNode } from 'graphql'
    const Schema: DocumentNode

    export = Schema
}

/**
 * Define the type for the static features yaml file
 */
declare module 'entities/*.yml' {
    interface Entity {
        id: string
        name: string
        mdn?: string
        caniuse?: string
    }
    const content: Entity[]

    export default content
}

/**
 * Define the type for the static projects yaml file
 */
declare module '*projects.yml' {
    interface ProjectData {
        id: string
        name: string
        description: string
        github: string
        stars: number
        homepage: string
    }
    const content: ProjectData[]

    export default content
}

declare module '*.yml' {
    const content: any
    export default content
}
