// NOTE: those paths might only be taken into account when opening the "results" folder directly
// instead of "monorepo"

// Those paths are resolved by webpack so we can import the right file
// for each survey
// So we need this trick to please TS
// TODO: this doesn't work yet...
declare module 'Logo/*' {
    export default React.Component
}
declare module 'Theme/*' {
    export default any
}

declare module 'Config/*' {
    export default any
}
