// Those paths are resolved by webpack so we can import the right file
// for each survey
// So we need this trick to please TS
// TODO: this doesn't work yet...
declare module 'Logo/*' {
    declare export default React.Component;

}
declare module 'Theme/*' {
    declare export default any
}


declare module 'Config/*' {
    declare export default any
}