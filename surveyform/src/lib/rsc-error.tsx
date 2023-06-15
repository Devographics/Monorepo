import { DetailedErrorObject } from "./validation";
import { DefaultErrorDisplay } from "~/components/error/DefaultError";

export interface RscErrorObject extends DetailedErrorObject {
  /** NOTE: Next doesn't yet allow to customize the response status in a RSC */
  status: number;
}

export class RscError extends Error {
  id: string;
  status: number;
  properties?: string;
  error?: any;
  constructor(props: RscErrorObject) {
    super(props.message);
    console.error("// RscError");
    console.error(props);
    this.id = props.id;
    this.status = props.status;
    this.properties = props.properties;
    this.error = props.error;
  }
  render() {
    return (
      <DefaultErrorDisplay
        titleI18nToken={this.id}
        title={this.message}
        error={this.error}
        proposeHomeRedirection={true}
        proposeReload={true}
      />
    );
  }
}
