"use client";
import omit from "lodash/omit.js";
import { useFormContext } from "@devographics/react-form";
import FormComponent from "../elements/FormComponent";

// const Locales: Array<{ id: string }> = []; // ?? might need to get this from context
export const FormIntlLayout = ({ children }) => (
  <div className="form-intl">{children}</div>
);
export const FormIntlItemLayout = ({ locale, children }) => (
  <div className={`form-intl-${locale.id}`}>{children}</div>
);

interface FormIntlProps /* extends FormComponentProps */ {
  path: string;
  name: string;
  // TODO: this should probably be provided by i18n context instead
  //Locales: Array<LocaleType>;
}

export const FormIntl = (props: FormIntlProps) => {
  const { getLabel } = useFormContext();
  // TODO: we don't have a globale "Locales" object anymore
  // so we need to get this from context somehow
  //const { Locales } = props;
  const Locales: Array<any> = []; // TODO: get it from i18n context instead that exposes the LocalesRegistry
  /*
  Note: ideally we'd try to make sure to return the right path no matter
  the order translations are stored in, but in practice we can't guarantee it
  so we just use the order of the Locales array.

  */
  const getLocalePath = (defaultIndex) => {
    return `${props.path}_intl.${defaultIndex}`;
  };

  const { name } = props;

  // do not pass FormIntl's own value, inputProperties, and intlInput props down
  const properties = omit(
    props,
    "value",
    "inputProperties",
    "intlInput",
    "nestedInput"
  );
  return (
    <FormIntlLayout>
      {Locales.map((locale, i) => (
        <FormIntlItemLayout key={locale.id} locale={locale}>
          {/** @ts-ignore */}
          <FormComponent
            // @ts-ignore
            {...properties}
            label={getLabel(name, locale.id)}
            path={getLocalePath(i)}
            locale={locale.id}
          />
        </FormIntlItemLayout>
      ))}
    </FormIntlLayout>
  );
};
